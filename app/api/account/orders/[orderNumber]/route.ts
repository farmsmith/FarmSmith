import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const headers = withSecurityHeaders();
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

  const { orderNumber } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, tracking_token, status, customer_name, customer_email, customer_phone, shipping_address, subtotal_amount, taxable_amount, shipping_amount, tax_amount, cgst_amount, sgst_amount, igst_amount, total_amount, currency, created_at, updated_at")
    .eq("order_number", orderNumber)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load customer order", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500, headers });
  }

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404, headers });

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
