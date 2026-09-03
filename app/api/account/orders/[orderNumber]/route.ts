import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { withSecurityHeaders } from "@/lib/security/headers";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const headers = withSecurityHeaders();
  const ip = getClientIp(request);
  const rl = await rateLimit(`account-order-detail:${ip}`, 20, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429, headers });
  }

  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

  const { orderNumber } = await params;
  const supabase = createAdminSupabaseClient();

  if (user.email) {
    const cleanEmail = user.email.trim().toLowerCase();
    await supabase
      .from("orders")
      .update({ customer_id: user.id })
      .eq("customer_email", cleanEmail)
      .is("customer_id", null);
  }

  const { data: rawOrder, error } = await supabase
    .from("orders")
    .select("id, order_number, tracking_token, status, customer_name, customer_email, customer_phone, shipping_address, subtotal_amount, taxable_amount, shipping_amount, tax_amount, cgst_amount, sgst_amount, igst_amount, total_amount, currency, awb_code, courier_name, shiprocket_order_id, shiprocket_shipment_id, created_at, updated_at")
    .eq("order_number", orderNumber)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load customer order", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500, headers });
  }

  if (!rawOrder) return NextResponse.json({ error: "Order not found" }, { status: 404, headers });

  const { reconcileOrderStatusFromShiprocket } = await import("@/lib/shipping/fulfillment-webhook");
  const order = await reconcileOrderStatusFromShiprocket(rawOrder);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, product_id, product_name, unit_price, quantity, subtotal, gst_rate, tax_amount")
    .eq("order_id", order.id);

  if (itemsError) {
    console.error("Failed to load order items", itemsError);
    return NextResponse.json({ error: "Failed to load order items" }, { status: 500, headers });
  }

  return NextResponse.json({ ...order, items: items ?? [] }, { status: 200, headers });
}
