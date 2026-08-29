import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  // Shiprocket sends token header for webhook verification if configured
  const webhookHeaderToken = request.headers.get("x-shiprocket-token");
  const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;

  if (expectedToken && webhookHeaderToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401, headers });
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  const orderId = body?.order_id || body?.custom_order_id;
  const currentStatus = String(body?.current_status || body?.status || "").toUpperCase();
  const awbCode = body?.awb_code || body?.awb;

  if (!orderId && !awbCode) {
    return NextResponse.json({ received: true }, { status: 200, headers });
  }

  const supabase = createAdminSupabaseClient();

  // Find order in Supabase DB
  let query = supabase.from("orders").select("id, status, order_number").limit(1);
  if (orderId) {
    query = query.or(`order_number.eq.${orderId},shiprocket_order_id.eq.${orderId}`);
  } else if (awbCode) {
    query = query.eq("awb_code", awbCode);
  }

  const { data: orders, error: findError } = await query;

  if (findError || !orders || orders.length === 0) {
    console.warn("Shiprocket Webhook: Order not found in database", { orderId, awbCode });
    return NextResponse.json({ received: true, note: "Order not found" }, { status: 200, headers });
  }

  const order = orders[0];
  const updatePayload: Record<string, any> = {};

  if (awbCode) {
    updatePayload.awb_code = awbCode;
  }
  if (body?.shipment_id) {
    updatePayload.shiprocket_shipment_id = String(body.shipment_id);
  }
  if (body?.courier_name) {
    updatePayload.courier_name = String(body.courier_name);
  }

  // Map Shiprocket shipment status to Farmsmith order status
  if (currentStatus.includes("DELIVERED")) {
    updatePayload.status = "delivered";
  } else if (
    currentStatus.includes("IN TRANSIT") ||
    currentStatus.includes("OUT FOR DELIVERY") ||
    currentStatus.includes("DISPATCHED") ||
    currentStatus.includes("SHIPPED") ||
    currentStatus.includes("PICKED UP")
  ) {
    updatePayload.status = "shipped";
  } else if (currentStatus.includes("CANCELLED") || currentStatus.includes("RTO")) {
    updatePayload.status = "cancelled";
  } else if (currentStatus.includes("PROCESSING") || currentStatus.includes("PACKING")) {
    updatePayload.status = "processing";
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update order status via Shiprocket webhook", updateError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500, headers });
    }
  }

  return NextResponse.json({ received: true, updatedStatus: updatePayload.status }, { status: 200, headers });
}
