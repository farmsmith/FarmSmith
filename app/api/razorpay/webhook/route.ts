import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";
import { withSecurityHeaders } from "@/lib/security/headers";
import { processOrderFulfillment } from "@/lib/shipping/fulfillment";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";

export async function POST(request: Request) {
  const headers = withSecurityHeaders();
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400, headers });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400, headers });
  }

  const supabase = createAdminSupabaseClient();

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;
    const internalOrderId = payment?.notes?.farmsmith_order_id;

    if (!razorpayOrderId && !internalOrderId) {
      return NextResponse.json({ received: true }, { status: 200, headers });
    }

    // Normal path: locate by the persisted Razorpay order ID. Fallback to the
    // internal order UUID stored in Razorpay notes to close the tiny mapping race.
    let orderQuery = supabase.from("orders").select("id, status").limit(1);
    if (razorpayOrderId) {
      orderQuery = orderQuery.eq("razorpay_order_id", razorpayOrderId);
    } else {
      orderQuery = orderQuery.eq("id", internalOrderId);
    }

    const { data: orders, error: findError } = await orderQuery;
    if (findError) {
      console.error("Failed to find order for captured payment", findError);
      return NextResponse.json({ error: "Temporary webhook failure" }, { status: 500, headers });
    }

    const order = orders?.[0];
    if (!order) {
      // Return non-2xx so Razorpay retries rather than silently losing a payment event.
      return NextResponse.json({ error: "Order not found" }, { status: 500, headers });
    }

    if (order.status === "pending_payment") {
      const paymentUpdate: Record<string, string> = {
        status: "paid",
        razorpay_payment_id: razorpayPaymentId,
      };
      if (razorpayOrderId) paymentUpdate.razorpay_order_id = razorpayOrderId;

      const { error } = await supabase
        .from("orders")
        .update(paymentUpdate)
        .eq("id", order.id)
        .eq("status", "pending_payment");

      if (error) {
        console.error("Failed to mark order paid", error);
        return NextResponse.json({ error: "Temporary webhook failure" }, { status: 500, headers });
      }

      // Trigger Shiprocket fulfillment and await completion (safely handles errors internally)
      await processOrderFulfillment(order.id);

      // Await order confirmation email send safely without throwing or breaking webhook response
      try {
        const emailRes = await sendOrderConfirmationEmail(order.id);
        if (!emailRes.success && !emailRes.skipped) {
          console.warn(`[RazorpayWebhook] Order confirmation email error for ${order.id}:`, emailRes.error);
        }
      } catch (emailErr) {
        console.error(`[RazorpayWebhook] Order confirmation email exception for ${order.id}:`, emailErr);
      }
    } else if (order.status === "paid" || order.status === "processing") {
      // Order already marked paid (e.g. by verify-payment route), ensure fulfillment & email confirmation are completed
      await processOrderFulfillment(order.id);
      try {
        await sendOrderConfirmationEmail(order.id);
      } catch (emailErr) {
        console.error(`[RazorpayWebhook] Order confirmation email exception for ${order.id}:`, emailErr);
      }
    } else if (order.status === "cancelled") {
      // A stale-order worker may have released stock just before Razorpay
      // captured the payment. Never silently discard a valid payment. Mark it
      // for reconciliation instead of pretending it is a normal cancelled order.
      const paymentUpdate: Record<string, string> = {
        status: "payment_captured_after_expiry",
        razorpay_payment_id: razorpayPaymentId,
      };
      if (razorpayOrderId) paymentUpdate.razorpay_order_id = razorpayOrderId;

      const { error } = await supabase
        .from("orders")
        .update(paymentUpdate)
        .eq("id", order.id)
        .eq("status", "cancelled");

      if (error) {
        console.error("Failed to flag late captured payment", error);
        return NextResponse.json({ error: "Temporary webhook failure" }, { status: 500, headers });
      }
    }
    // paid / processing / shipped / delivered / refunded are already terminal
    // or further along. The webhook is idempotent and returns 200.
  }

  if (event.event === "payment.failed") {
    // Keep pending_payment so the customer can retry while the order has not
    // expired. The stale-order job eventually releases its reservation.
  }

  return NextResponse.json({ received: true }, { status: 200, headers });
}
