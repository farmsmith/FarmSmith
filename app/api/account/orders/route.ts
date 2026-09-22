import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { withSecurityHeaders } from "@/lib/security/headers";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export async function GET(request: Request) {
  const headers = withSecurityHeaders();
  const ip = getClientIp(request);
  const rl = await rateLimit(`account-orders:${ip}`, 20, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429, headers });
  }

  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

  const { searchParams } = new URL(request.url);
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const rawLimit = parseInt(searchParams.get("limit") ?? searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`, 10);

  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit >= 1
    ? Math.min(rawLimit, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createAdminSupabaseClient();

  // Auto-link any unlinked past guest orders matching user's email to their customer_id
  if (user.email) {
    const cleanEmail = user.email.trim().toLowerCase();
    const { error: linkErr } = await supabase
      .from("orders")
      .update({ customer_id: user.id })
      .eq("customer_email", cleanEmail)
      .is("customer_id", null);

    if (linkErr) {
      console.error("Failed to auto-link customer_id to orders:", linkErr);
    }
  }

  // Fetch orders strictly using the authenticated user's immutable customer_id with bounded pagination
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select("id, order_number, tracking_token, status, subtotal_amount, shipping_amount, tax_amount, total_amount, currency, awb_code, courier_name, shiprocket_order_id, shiprocket_shipment_id, created_at, updated_at, order_items(id, product_name, quantity, unit_price, subtotal)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to load customer orders", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500, headers });
  }

  const orders = (rawOrders ?? []).map((order) => {
    const { order_items, ...rest } = order as Record<string, unknown> & { order_items?: unknown[] };
    return {
      ...rest,
      items: order_items ?? [],
    };
  });

  return NextResponse.json(orders, { status: 200, headers });
}


