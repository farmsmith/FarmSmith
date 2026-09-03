import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  createShiprocketOrder,
  getShiprocketOrderByChannelId,
} from "@/lib/shiprocket/client";
import type { CreateShiprocketOrderPayload, ShiprocketOrderItem } from "@/lib/shiprocket/types";

/**
 * Calculates package tier dimensions based on total gross weight in kg.
 */
export function calculatePackageDimensions(weightKg: number): {
  length: number;
  breadth: number;
  height: number;
} {
  if (weightKg <= 1.0) {
    return { length: 15, breadth: 15, height: 10 }; // Tier 1: Small Box
  } else if (weightKg <= 3.0) {
    return { length: 20, breadth: 20, height: 15 }; // Tier 2: Medium Box
  } else {
    return { length: 30, breadth: 25, height: 20 }; // Tier 3: Large Box
  }
}

export interface FulfillmentResult {
  status: "success" | "reconciled" | "skipped" | "failed";
  shiprocket_order_id?: string;
  shiprocket_shipment_id?: string;
  error?: string;
}

/**
 * Executes idempotent order fulfillment pushing to Shiprocket.
 * Safe to be called concurrently from payment verification & webhooks.
 */
export async function processOrderFulfillment(orderId: string): Promise<FulfillmentResult> {
  let supabase;
  try {
    supabase = createAdminSupabaseClient();
  } catch (initErr: any) {
    const errorMsg = initErr?.message || String(initErr);
    console.error(`[Fulfillment] Initialization failed for order ${orderId}:`, errorMsg);
    return { status: "failed", error: errorMsg };
  }

  try {
    // 1. First fetch order to check status & order_number
    const { data: initialOrder, error: fetchErr } = await supabase
      .from("orders")
      .select("id, order_number, status, fulfillment_status, shiprocket_order_id")
      .eq("id", orderId)
      .single();

    if (fetchErr || !initialOrder) {
      console.error(`[Fulfillment] Order ${orderId} not found:`, fetchErr?.message);
      return { status: "failed", error: fetchErr?.message || "Order not found" };
    }

    // If already created or has shiprocket_order_id, exit cleanly
    if (initialOrder.shiprocket_order_id) {
      return {
        status: "skipped",
        shiprocket_order_id: initialOrder.shiprocket_order_id,
      };
    }

    // 2. Claim atomic DB lock: transition from ('pending' | 'failed') to 'creating'
    const { data: claimedRows, error: lockErr } = await supabase
      .from("orders")
      .update({
        fulfillment_status: "creating",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", "paid")
      .in("fulfillment_status", ["pending", "failed"])
      .is("shiprocket_order_id", null)
      .select("id, order_number");

    if (lockErr || !claimedRows || claimedRows.length === 0) {
      // Lock failed: another worker is already processing, or order is not paid
      console.warn(`[Fulfillment] Lock skip for order ${orderId}`);
      return { status: "skipped" };
    }

    const orderNumber = initialOrder.order_number;

    // 3. Pre-Flight External Check (Crash Recovery): Check if Shiprocket already holds this channel order
    const existingSROrder = await getShiprocketOrderByChannelId(orderNumber);
    if (existingSROrder && existingSROrder.id) {
      const srOrderId = String(existingSROrder.id);
      const srShipmentId = existingSROrder.shipments?.[0]?.id
        ? String(existingSROrder.shipments[0].id)
        : null;
      const awbCode = existingSROrder.shipments?.[0]?.awb_code || null;
      const courierName = existingSROrder.shipments?.[0]?.courier_name || null;

      await supabase
        .from("orders")
        .update({
          shiprocket_order_id: srOrderId,
          shiprocket_shipment_id: srShipmentId,
          awb_code: awbCode,
          courier_name: courierName,
          fulfillment_status: "created",
          status: "processing",
          shiprocket_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return {
        status: "reconciled",
        shiprocket_order_id: srOrderId,
        shiprocket_shipment_id: srShipmentId || undefined,
      };
    }

    // 4. Fetch full order, items, and product weights for payload construction
    const { data: fullOrder, error: fullOrderErr } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          subtotal,
          tax_amount
        )
      `)
      .eq("id", orderId)
      .single();

    if (fullOrderErr || !fullOrder) {
      throw new Error(`Failed to load full order details: ${fullOrderErr?.message}`);
    }

    // Fetch product weight_grams for line items
    const productIds = (fullOrder.order_items || [])
      .map((item: any) => item.product_id)
      .filter(Boolean);

    let productWeightsMap = new Map<string, number>();
    if (productIds.length > 0) {
      const { data: productRows } = await supabase
        .from("products")
        .select("id, weight_grams, sku")
        .in("id", productIds);

      if (productRows) {
        productRows.forEach((p: any) => {
          productWeightsMap.set(p.id, p.weight_grams ?? 500);
        });
      }
    }

    // Calculate total gross weight
    let totalWeightGrams = 0;
    const items: ShiprocketOrderItem[] = (fullOrder.order_items || []).map((item: any) => {
      const weightGrams = productWeightsMap.get(item.product_id) ?? 500;
      totalWeightGrams += weightGrams * (item.quantity || 1);

      return {
        name: item.product_name,
        sku: item.product_id ? item.product_id.substring(0, 30) : "FS-ITEM",
        units: item.quantity,
        selling_price: Number(item.unit_price),
        tax: Number(item.tax_amount || 0),
        discount: 0,
      };
    });

    // Add tare/packaging weight (50g)
    const totalWeightKg = Math.max(0.1, Number(((totalWeightGrams + 50) / 1000).toFixed(2)));
    const dimensions = calculatePackageDimensions(totalWeightKg);

    // Format created_at to "YYYY-MM-DD HH:mm"
    const orderDate = new Date(fullOrder.created_at || Date.now());
    const formattedDate = orderDate.toISOString().replace("T", " ").substring(0, 16);

    const shippingAddr = fullOrder.shipping_address || {};

    const nameParts = (fullOrder.customer_name || "Customer Customer").trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
    if (!pickupLocation) {
      throw new Error("SHIPROCKET_PICKUP_LOCATION is not configured in environment variables.");
    }

    const payload: CreateShiprocketOrderPayload = {
      order_id: fullOrder.order_number,
      order_date: formattedDate,
      pickup_location: pickupLocation,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: shippingAddr.line1 || "Main Street",
      billing_address_2: shippingAddr.line2 || "",
      billing_city: shippingAddr.city || "City",
      billing_pincode: shippingAddr.pincode || "110001",
      billing_state: shippingAddr.state || "State",
      billing_country: "India",
      billing_email: fullOrder.customer_email || "customer@example.com",
      billing_phone: fullOrder.customer_phone || "9999999999",
      shipping_is_billing: true,
      order_items: items,
      payment_method: "Prepaid",
      sub_total: Number(fullOrder.subtotal_amount),
      shipping_charges: Number(fullOrder.shipping_amount || 0),
      total_discount: 0,
      length: dimensions.length,
      breadth: dimensions.breadth,
      height: dimensions.height,
      weight: totalWeightKg,
    };

    // 5. Create Order in Shiprocket
    let res;
    try {
      res = await createShiprocketOrder(payload);
    } catch (createErr: any) {
      const errText = createErr?.message || String(createErr);
      // Check if error is a 422 duplicate order response
      if (errText.toLowerCase().includes("already exists") || errText.toLowerCase().includes("already been taken") || createErr?.statusCode === 422) {
        console.warn(`[Fulfillment] 422 Duplicate caught for ${orderNumber}, running lookup reconciliation`);
        const reconciled = await getShiprocketOrderByChannelId(orderNumber);
        if (reconciled && reconciled.id) {
          const srOrderId = String(reconciled.id);
          const srShipmentId = reconciled.shipments?.[0]?.id ? String(reconciled.shipments[0].id) : null;
          const awbCode = reconciled.shipments?.[0]?.awb_code || null;
          const courierName = reconciled.shipments?.[0]?.courier_name || null;

          await supabase
            .from("orders")
            .update({
              shiprocket_order_id: srOrderId,
              shiprocket_shipment_id: srShipmentId,
              awb_code: awbCode,
              courier_name: courierName,
              fulfillment_status: "created",
              status: "processing",
              shiprocket_error: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          return {
            status: "reconciled",
            shiprocket_order_id: srOrderId,
            shiprocket_shipment_id: srShipmentId || undefined,
          };
        }
      }

      // Other error (network timeout, auth failure, etc.)
      throw createErr;
    }

    // 6. Save Shiprocket Order details to Supabase
    const rawOrderId = res.order_id ?? (res as any).data?.order_id ?? (res as any).id;
    const rawShipmentId = res.shipment_id ?? (res as any).data?.shipment_id;

    if (!rawOrderId) {
      throw new Error(`Shiprocket creation response missing order_id: ${JSON.stringify(res)}`);
    }

    const srOrderId = String(rawOrderId);
    const srShipmentId = rawShipmentId ? String(rawShipmentId) : null;
    const awbCode = res.awb_code || null;
    const courierName = res.courier_name || null;

    await supabase
      .from("orders")
      .update({
        shiprocket_order_id: srOrderId,
        shiprocket_shipment_id: srShipmentId,
        awb_code: awbCode,
        courier_name: courierName,
        fulfillment_status: "created",
        status: "processing",
        shiprocket_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return {
      status: "success",
      shiprocket_order_id: srOrderId,
      shiprocket_shipment_id: srShipmentId || undefined,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(`[Fulfillment] Order fulfillment failed for ${orderId}:`, errorMsg);

    // Save failure status without altering payment paid status
    await supabase
      .from("orders")
      .update({
        fulfillment_status: "failed",
        shiprocket_error: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return {
      status: "failed",
      error: errorMsg,
    };
  }
}
