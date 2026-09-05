import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { withSecurityHeaders } from "@/lib/security/headers";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const headers = withSecurityHeaders();
  const ip = getClientIp(request);
  const rl = await rateLimit(`account-orders:${ip}`, 20, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429, headers });
  }

  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

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

  // Fetch orders strictly using the authenticated user's immutable customer_id
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select("id, order_number, tracking_token, status, subtotal_amount, shipping_amount, tax_amount, total_amount, currency, shiprocket_order_id, shiprocket_shipment_id, created_at, updated_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load customer orders", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500, headers });
  }

  return NextResponse.json(rawOrders ?? [], { status: 200, headers });
}

