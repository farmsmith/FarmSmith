import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { orderTrackingSchema } from "@/lib/validation/order";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";
import type { PublicOrderStatus, ShippingAddress } from "@/types/order";

/**
 * Order Tracking Authorization & PII Protection (FINDING-004 Remediation):
 * - Providing the 256-bit tracking_token grants full authorized access to order details,
 *   line items, customer name, and full delivery address.
 * - Providing email or phone without the tracking token returns a privacy-preserving,
 *   minimal tracking status without sensitive PII (customer name, phone, shipping address,
 *   and purchased items are completely withheld).
 */
export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(request);
  const rl = await rateLimit(`track:${ip}`, 10, 60_000);
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

  const rawIdentifier = (parsed.data.identifier || parsed.data.phoneOrEmail || parsed.data.trackingToken || "").trim();
  const rawOrderNumber = parsed.data.orderNumber.trim();

  const supabase = createAdminSupabaseClient();

  const { data: rawOrder, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, tracking_token, status, customer_email, customer_name, customer_phone, shipping_address, subtotal_amount, taxable_amount, shipping_amount, tax_amount, total_amount, currency, awb_code, courier_name, shiprocket_order_id, shiprocket_shipment_id, created_at, updated_at"
    )
    .eq("order_number", rawOrderNumber)
    .maybeSingle();

  if (error || !rawOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404, headers });
  }

  // 1. High-entropy token verification (256-bit cryptographic token authorization)
  const tokenMatch = Boolean(rawOrder.tracking_token && rawOrder.tracking_token === rawIdentifier);

  // 2. Convenience identifier check (email / phone)
  const cleanInput = rawIdentifier.toLowerCase();
  const emailMatch = Boolean(rawOrder.customer_email && rawOrder.customer_email.trim().toLowerCase() === cleanInput);

  const inputDigits = rawIdentifier.replace(/\D/g, "");
  const orderPhoneDigits = (rawOrder.customer_phone || "").replace(/\D/g, "");
  const phoneMatch = Boolean(
    inputDigits.length >= 10 &&
    orderPhoneDigits.length >= 10 &&
    (orderPhoneDigits.endsWith(inputDigits.slice(-10)) || inputDigits.endsWith(orderPhoneDigits.slice(-10)))
  );

  // If neither tracking token nor phone/email matches, fail closed with 404
  if (!tokenMatch && !emailMatch && !phoneMatch) {
    return NextResponse.json({ error: "Order not found" }, { status: 404, headers });
  }

  // Import fulfillment reconciliation dynamically to run server-side status fallback for active orders
  const { reconcileOrderStatusFromShiprocket } = await import("@/lib/shipping/fulfillment-webhook");
  const order = await reconcileOrderStatusFromShiprocket(rawOrder);

  // Calculate pricing totals
  const subtotal_amount = order.subtotal_amount ?? 0;
  const shipping_amount = order.shipping_amount ?? 60;
  const tax_amount = order.tax_amount ?? Math.round(subtotal_amount * 0.05);
  const total_amount = order.total_amount ?? (subtotal_amount + shipping_amount + tax_amount);

  if (tokenMatch) {
    // Authorized with 256-bit cryptographic token -> full order, items & address details
    const { data: itemsData } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price, subtotal")
      .eq("order_id", order.id);

    const items = itemsData ?? [];

    const response: PublicOrderStatus = {
      order_number: order.order_number,
      tracking_token: order.tracking_token,
      status: order.status,
      created_at: order.created_at,
      subtotal_amount,
      shipping_amount,
      tax_amount,
      total_amount,
      currency: order.currency ?? "INR",
      awb_code: order.awb_code || null,
      courier_name: order.courier_name || null,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address as ShippingAddress,
      items,
    };

    return NextResponse.json(response, { status: 200, headers });
  }

  // Minimal / Non-Sensitive Status: Accessed via phone/email without secret tracking token
  // Strictly omits customer name, phone number, shipping address, and purchased items.
  const response: PublicOrderStatus = {
    order_number: order.order_number,
    status: order.status,
    created_at: order.created_at,
    subtotal_amount,
    shipping_amount,
    tax_amount,
    total_amount,
    currency: order.currency ?? "INR",
    awb_code: order.awb_code || null,
    courier_name: order.courier_name || null,
    items: [],
  };

  return NextResponse.json(response, { status: 200, headers });
}
