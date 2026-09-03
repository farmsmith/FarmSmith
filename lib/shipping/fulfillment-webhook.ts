import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { withSecurityHeaders } from "@/lib/security/headers";
import type { OrderStatus } from "@/types/order";

/**
 * Normalizes and maps Shiprocket shipment statuses to FarmSmith OrderStatus.
 *
 * Status Rules per Official Shiprocket Documentation:
 * - 16 = "CANCELLATION REQUESTED" -> returns null (preserves active order status until confirmed).
 * - 8 = "CANCELLED", 45 = "CANCELLED BEFORE DISPATCHED", 46 / 9 = "RTO IN TRANSIT", 10 = "RTO DELIVERED", 15 = "RETURN IN TRANSIT", 16 = "RETURN DELIVERED" -> "cancelled".
 * - 7 = "DELIVERED" -> "delivered".
 * - 6 = "SHIPPED", 17 = "OUT FOR DELIVERY", 18 = "IN TRANSIT", 42 = "PICKED UP", 1 = "AWB ASSIGNED", 2 = "LABEL GENERATED", 3 = "PICKUP SCHEDULED", 14 = "DISPATCHED" -> "shipped".
 * - "PROCESSING", "PACKING", "NEW", "ORDER CREATED" -> "processing".
 */
export function mapShiprocketStatusToOrderStatus(
  rawStatusStr?: string | null,
  statusCodeRaw?: number | string | null
): OrderStatus | null {
  const rawStatus = rawStatusStr ? String(rawStatusStr).trim().toUpperCase() : "";
  const statusCode = statusCodeRaw !== null && statusCodeRaw !== undefined ? Number(statusCodeRaw) : null;

  if (!rawStatus && statusCode === null) {
    return null;
  }

  // 1. Explicitly check for CANCELLATION REQUESTED first (Status Code 16 or string matching).
  // "CANCELLATION REQUESTED" is pending review in Shiprocket and NOT a confirmed cancellation.
  // Return null to ensure the active FarmSmith order status is not overwritten until confirmed.
  if (
    rawStatus === "CANCELLATION REQUESTED" ||
    rawStatus.includes("CANCELLATION REQUEST") ||
    rawStatus.includes("CANCEL REQUEST") ||
    statusCode === 16
  ) {
    return null;
  }

  // 2. Confirmed Cancellations & Returns -> "cancelled"
  if (
    rawStatus === "CANCELED" ||
    rawStatus === "CANCELLED" ||
    rawStatus === "VOID" ||
    rawStatus.includes("CANCELED BY") ||
    rawStatus.includes("CANCELLED BY") ||
    rawStatus.includes("CANCELLATION CONFIRMED") ||
    rawStatus.startsWith("RTO") ||
    rawStatus.includes(" RTO") ||
    rawStatus.startsWith("RETURN") ||
    rawStatus.includes(" RETURN") ||
    statusCode === 8 ||  // Cancelled
    statusCode === 9 ||  // RTO In Transit
    statusCode === 10 || // RTO Delivered
    statusCode === 15 || // Return In Transit
    statusCode === 45 || // Cancelled Before Dispatched
    statusCode === 46    // RTO In Transit
  ) {
    return "cancelled";
  }

  // 3. Delivered -> "delivered"
  if (
    rawStatus.includes("DELIVERED") ||
    rawStatus.includes("FULFILLED") ||
    rawStatus.includes("COMPLETED") ||
    statusCode === 7
  ) {
    return "delivered";
  }

  // 4. Shipped / In Transit / Out for Delivery / Picked Up -> "shipped"
  if (
    rawStatus.includes("IN TRANSIT") ||
    rawStatus.includes("OUT FOR DELIVERY") ||
    rawStatus.includes("DISPATCHED") ||
    rawStatus.includes("SHIPPED") ||
    rawStatus.includes("PICKED UP") ||
    rawStatus.includes("PICKUP COMPLETED") ||
    rawStatus.includes("PICKUP SCHEDULED") ||
    rawStatus.includes("AWB ASSIGNED") ||
    rawStatus.includes("LABEL GENERATED") ||
    rawStatus.includes("MANIFEST GENERATED") ||
    rawStatus.includes("HANDOVER TO COURIER") ||
    rawStatus.includes("REACHED AT DESTINATION") ||
    statusCode === 1 ||
    statusCode === 2 ||
    statusCode === 3 ||
    statusCode === 4 ||
    statusCode === 5 ||
    statusCode === 6 ||  // Shipped
    statusCode === 14 || // Dispatched
    statusCode === 17 || // Out For Delivery
    statusCode === 18 || // In Transit
    statusCode === 42    // Picked Up (per official Shiprocket docs)
  ) {
    return "shipped";
  }

  // 5. Processing / Packing -> "processing"
  if (
    rawStatus.includes("PROCESSING") ||
    rawStatus.includes("PACKING") ||
    rawStatus === "NEW" ||
    rawStatus.startsWith("NEW ") ||
    rawStatus.includes("ORDER CREATED") ||
    rawStatus.includes("READY FOR SHIPMENT") ||
    rawStatus.includes("PENDING PICKUP")
  ) {
    return "processing";
  }

  return null;
}

/**
 * In-memory map to deduplicate concurrent status reconciliation requests for the same order.
 */
const inFlightReconciliations = new Map<string, Promise<any>>();

/**
 * Minimum interval between Shiprocket API reconciliation calls per order (60 seconds).
 */
const RECONCILIATION_THROTTLE_MS = 60_000;

/**
 * Server-side fallback reconciliation for active orders.
 * Queries Shiprocket API on-demand when active orders ('processing', 'shipped') are viewed.
 */
export async function reconcileOrderStatusFromShiprocket(order: any): Promise<any> {
  if (!order || (order.status !== "processing" && order.status !== "shipped")) {
    return order;
  }

  // Throttle check: Skip if updated within the last 60 seconds
  if (order.updated_at) {
    const lastUpdate = new Date(order.updated_at).getTime();
    if (Date.now() - lastUpdate < RECONCILIATION_THROTTLE_MS) {
      return order;
    }
  }

  // Deduplicate concurrent requests for the same order ID
  const existingPromise = inFlightReconciliations.get(order.id);
  if (existingPromise) {
    return existingPromise;
  }

  const reconciliationPromise = (async () => {
    try {
      // Import client dynamically to prevent circular dependencies
      const { getShiprocketOrderByChannelId } = await import("@/lib/shiprocket/client");

      const srOrder = await getShiprocketOrderByChannelId(order.order_number);
      if (!srOrder) {
        return order;
      }

      const rawStatus = srOrder.status;
      const statusCode = srOrder.status_code;
      const shipment = srOrder.shipments?.[0];
      const awbCode = shipment?.awb_code || null;
      const courierName = shipment?.courier_name || null;
      const srShipmentId = shipment?.id ? String(shipment.id) : null;
      const srOrderId = srOrder.id ? String(srOrder.id) : null;

      const mappedStatus = mapShiprocketStatusToOrderStatus(rawStatus, statusCode);

      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (srOrderId && !order.shiprocket_order_id && !srOrderId.startsWith("FS-")) {
        updatePayload.shiprocket_order_id = srOrderId;
      }
      if (srShipmentId && !order.shiprocket_shipment_id) {
        updatePayload.shiprocket_shipment_id = srShipmentId;
      }
      if (awbCode && order.awb_code !== awbCode) {
        updatePayload.awb_code = awbCode;
      }
      if (courierName && order.courier_name !== String(courierName)) {
        updatePayload.courier_name = String(courierName);
      }

      if (mappedStatus && mappedStatus !== order.status) {
        updatePayload.status = mappedStatus;
      }

      if (Object.keys(updatePayload).length > 1) {
        const supabase = createAdminSupabaseClient();
        const { data: updatedRows, error: updateError } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", order.id)
          .select();

        if (updateError) {
          console.error("[Reconciliation] Failed to update order status:", updateError.message);
          return order;
        }

        if (updatedRows && updatedRows.length > 0) {
          return { ...order, ...updatedRows[0] };
        }
      }

      return order;
    } catch (err: any) {
      // Graceful error handling: log sanitized warning, keep existing status
      const errorMsg = err?.message || String(err);
      console.warn(`[Reconciliation] Shiprocket status lookup failed for ${order.order_number}:`, errorMsg);
      return order;
    } finally {
      inFlightReconciliations.delete(order.id);
    }
  })();

  inFlightReconciliations.set(order.id, reconciliationPromise);
  return reconciliationPromise;
}

/**
 * Shared canonical handler for Shiprocket fulfillment webhooks.
 * Supports authentication via x-api-key, x-shiprocket-token, or authorization headers.
 */
export async function handleShiprocketWebhook(request: Request): Promise<NextResponse> {
  const headers = withSecurityHeaders();

  // Shiprocket sends token header for webhook verification
  const webhookHeaderToken =
    request.headers.get("x-shiprocket-token") ||
    request.headers.get("x-api-key") ||
    request.headers.get("authorization");
  const expectedToken = process.env.SHIPROCKET_WEBHOOK_SECRET || process.env.SHIPROCKET_WEBHOOK_TOKEN;

  // Fail closed: require webhook secret to be set and matched
  if (!expectedToken) {
    console.error("[Shiprocket Webhook] SHIPROCKET_WEBHOOK_SECRET is not configured on the server.");
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

  const srOrderId = body?.order_id
    ? String(body.order_id).trim()
    : body?.sr_order_id
    ? String(body.sr_order_id).trim()
    : null;

  const srShipmentId = body?.shipment_id ? String(body.shipment_id).trim() : null;

  const channelOrderId =
    body?.channel_order_id || body?.custom_order_id || body?.channel_order_number
      ? String(body.channel_order_id || body.custom_order_id || body.channel_order_number).trim()
      : null;

  const rawAwb = body?.awb_code || body?.awb || body?.awb_number;
  const awbCode = rawAwb ? String(rawAwb).trim() : null;

  if (!srOrderId && !srShipmentId && !channelOrderId && !awbCode) {
    return NextResponse.json({ received: true, note: "No order identifier present in webhook payload" }, { status: 200, headers });
  }

  const supabase = createAdminSupabaseClient();

  let order: any = null;

  // 1. Primary lookup by shiprocket_order_id
  if (srOrderId) {
    const { data: bySrId } = await supabase
      .from("orders")
      .select("id, status, shiprocket_order_id, shiprocket_shipment_id, order_number, awb_code, courier_name")
      .eq("shiprocket_order_id", srOrderId)
      .limit(1);

    if (bySrId && bySrId.length > 0) {
      order = bySrId[0];
    }
  }

  // 2. Lookup by shiprocket_shipment_id
  if (!order && srShipmentId) {
    const { data: byShipmentId } = await supabase
      .from("orders")
      .select("id, status, shiprocket_order_id, shiprocket_shipment_id, order_number, awb_code, courier_name")
      .eq("shiprocket_shipment_id", srShipmentId)
      .limit(1);

    if (byShipmentId && byShipmentId.length > 0) {
      order = byShipmentId[0];
    }
  }

  // 3. Fallback lookup by channel order number (order_number)
  const possibleChannelId = channelOrderId || (srOrderId && srOrderId.startsWith("FS-") ? srOrderId : null);
  if (!order && possibleChannelId) {
    const { data: byChannelId } = await supabase
      .from("orders")
      .select("id, status, shiprocket_order_id, shiprocket_shipment_id, order_number, awb_code, courier_name")
      .eq("order_number", possibleChannelId)
      .limit(1);

    if (byChannelId && byChannelId.length > 0) {
      order = byChannelId[0];
    }
  }

  // 4. Fallback lookup by awb_code
  if (!order && awbCode) {
    const { data: byAwb } = await supabase
      .from("orders")
      .select("id, status, shiprocket_order_id, shiprocket_shipment_id, order_number, awb_code, courier_name")
      .eq("awb_code", awbCode)
      .limit(1);

    if (byAwb && byAwb.length > 0) {
      order = byAwb[0];
    }
  }

  if (!order) {
    console.warn("[Shiprocket Webhook] Order not found in database", { srOrderId, srShipmentId, channelOrderId, awbCode });
    return NextResponse.json({ received: true, note: "Order not found" }, { status: 200, headers });
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (srOrderId && !order.shiprocket_order_id && !srOrderId.startsWith("FS-")) {
    updatePayload.shiprocket_order_id = srOrderId;
  }
  if (srShipmentId && !order.shiprocket_shipment_id) {
    updatePayload.shiprocket_shipment_id = srShipmentId;
  }
  if (awbCode && order.awb_code !== awbCode) {
    updatePayload.awb_code = awbCode;
  }
  const courierName = body?.courier_name || body?.courier_company_name || body?.courier;
  if (courierName && order.courier_name !== String(courierName)) {
    updatePayload.courier_name = String(courierName);
  }

  const rawStatus = body?.current_status || body?.status || body?.shipment_status;
  const statusCode = body?.status_code || body?.current_status_id;
  const mappedStatus = mapShiprocketStatusToOrderStatus(rawStatus, statusCode);

  if (mappedStatus) {
    updatePayload.status = mappedStatus;
  } else {
    const rawStatusStr = rawStatus ? String(rawStatus).trim() : "";
    if (rawStatusStr && !rawStatusStr.toUpperCase().includes("CANCELLATION REQUEST")) {
      console.warn("[Shiprocket Webhook] Received unknown or unmapped shipment status:", {
        rawStatus: rawStatusStr,
        statusCode,
        orderNumber: order.order_number,
      });
    }
  }

  if (Object.keys(updatePayload).length > 1) { // More than just updated_at
    const { error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", order.id);

    if (updateError) {
      console.error("[Shiprocket Webhook] Failed to update order status:", updateError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500, headers });
    }
  }

  return NextResponse.json(
    { received: true, orderNumber: order.order_number, updatedStatus: updatePayload.status ?? order.status },
    { status: 200, headers }
  );
}

