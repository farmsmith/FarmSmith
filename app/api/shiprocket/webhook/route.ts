import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  // Shiprocket sends token header for webhook verification
  const webhookHeaderToken =
    request.headers.get("x-shiprocket-token") ||
    request.headers.get("x-api-key") ||
    request.headers.get("authorization");
  const expectedToken = process.env.SHIPROCKET_WEBHOOK_SECRET || process.env.SHIPROCKET_WEBHOOK_TOKEN;

  // Fail closed: require webhook secret to be set and matched
  if (!expectedToken) {
    console.error("SHIPROCKET_WEBHOOK_SECRET is not configured on the server.");
    return NextResponse.json(
      { error: "Webhook endpoint not configured" },
      { status: 500, headers }
    );
  }

  if (!webhookHeaderToken || webhookHeaderToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401, headers });
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  const srOrderId = body?.order_id ? String(body.order_id).trim() : null;
  const channelOrderId = body?.channel_order_id || body?.custom_order_id ? String(body.channel_order_id || body.custom_order_id).trim() : null;
  const rawAwb = body?.awb_code || body?.awb;
  const awbCode = rawAwb ? String(rawAwb).trim() : null;
  const currentStatus = String(body?.current_status || body?.status || "").toUpperCase();

  if (!srOrderId && !channelOrderId && !awbCode) {
    return NextResponse.json({ received: true, note: "No order identifier present" }, { status: 200, headers });
  }

  const supabase = createAdminSupabaseClient();

  let order: any = null;

  // 1. Primary lookup by shiprocket_order_id
  if (srOrderId) {
    const { data: bySrId } = await supabase
      .from("orders")
      .select("id, status, shiprocket_order_id, order_number")
      .eq("shiprocket_order_id", srOrderId)
      .limit(1);

    if (bySrId && bySrId.length > 0) {
      order = bySrId[0];
    }
  }

  // 2. Fallback lookup by channel_order_id if shiprocket_order_id match was not found
  if (!order && channelOrderId) {
    const { data: byChannelId } = await supabase
      .from("orders")
      .select("id, status, shiprocket_order_id, order_number")
      .eq("order_number", channelOrderId)
      .limit(1);

    if (byChannelId && byChannelId.length > 0) {
      order = byChannelId[0];
    }
  }

  // 3. Fallback lookup by awb_code
  if (!order && awbCode) {
    const { data: byAwb } = await supabase
      .from("orders")
      .select("id, status, shiprocket_order_id, order_number")
      .eq("awb_code", awbCode)
      .limit(1);

    if (byAwb && byAwb.length > 0) {
      order = byAwb[0];
    }
  }

  if (!order) {
    console.warn("Shiprocket Webhook: Order not found in database", { srOrderId, channelOrderId, awbCode });
    return NextResponse.json({ received: true, note: "Order not found" }, { status: 200, headers });
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (srOrderId && !order.shiprocket_order_id) {
    updatePayload.shiprocket_order_id = srOrderId;
  }
  if (awbCode) {
    updatePayload.awb_code = awbCode;
  }
  if (body?.shipment_id) {
    updatePayload.shiprocket_shipment_id = String(body.shipment_id);
  }
  if (body?.courier_name) {
    updatePayload.courier_name = String(body.courier_name);
  }

  // Map Shiprocket shipment status to FarmSmith order status
  if (currentStatus.includes("CANCELLED") || currentStatus.includes("RTO") || currentStatus.includes("RETURN")) {
    updatePayload.status = "cancelled";
  } else if (currentStatus.includes("DELIVERED")) {
    updatePayload.status = "delivered";
  } else if (
    currentStatus.includes("IN TRANSIT") ||
    currentStatus.includes("OUT FOR DELIVERY") ||
    currentStatus.includes("DISPATCHED") ||
    currentStatus.includes("SHIPPED") ||
    currentStatus.includes("PICKED UP")
  ) {
    updatePayload.status = "shipped";
  } else if (currentStatus.includes("PROCESSING") || currentStatus.includes("PACKING")) {
    updatePayload.status = "processing";
  }

  if (Object.keys(updatePayload).length > 1) { // More than just updated_at
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
