import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { orderTrackingSchema } from "@/lib/validation/order";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";
import type { PublicOrderStatus } from "@/types/order";

/**
 * Order tracking deliberately requires BOTH order_number and
 * tracking_token. order_number alone is sequential/guessable and
 * must never be sufficient on its own to reveal a customer's data.
 */
export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(request);
  const rl = rateLimit(`track:${ip}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = orderTrackingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers });
  }

  const supabase = createAdminSupabaseClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at, total_amount, subtotal_amount, shipping_amount, tax_amount, currency")
    .eq("order_number", parsed.data.orderNumber)
    .eq("tracking_token", parsed.data.trackingToken)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404, headers });
  }

  const { data: itemsData } = await supabase
    .from("order_items")
    .select("product_name, quantity, unit_price, subtotal")
    .eq("order_id", order.id);

  const items = itemsData ?? [];

  // Calculate items subtotal if missing
  const calculatedSubtotal = items.reduce((sum, item) => sum + (item.subtotal || item.unit_price * item.quantity), 0);
  const subtotal_amount = order.subtotal_amount ?? calculatedSubtotal;
  const shipping_amount = order.shipping_amount ?? (subtotal_amount >= 499 || subtotal_amount === 0 ? 0 : 50);
  const tax_amount = order.tax_amount ?? Math.round(subtotal_amount * 0.05); // 5% GST
  const total_amount = order.total_amount ?? (subtotal_amount + shipping_amount + tax_amount);

  const response: PublicOrderStatus = {
    order_number: order.order_number,
    status: order.status,
    created_at: order.created_at,
    subtotal_amount,
    shipping_amount,
    tax_amount,
    total_amount,
    currency: order.currency ?? "INR",
    items,
  };

  return NextResponse.json(response, { status: 200, headers });
}
