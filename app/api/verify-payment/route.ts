import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";
import { processOrderFulfillment } from "@/lib/shipping/fulfillment";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";

export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(request);
  const rl = await rateLimit(`verify-payment:${ip}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many payment verification attempts. Please wait a moment." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400, headers }
      );
    }

    // Support both snake_case (Razorpay SDK) and camelCase
    const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId;
    const razorpay_payment_id = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpay_signature = body.razorpay_signature || body.razorpaySignature;
    const order_number = body.order_number || body.orderNumber;
    const tracking_token = body.tracking_token || body.trackingToken;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
        },
        { status: 400, headers }
      );
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      console.warn("Payment verification failed: Signature mismatch", {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return NextResponse.json(
        { success: false, error: "Invalid payment signature." },
        { status: 400, headers }
      );
    }

    // Direct server-side API call to Razorpay to verify authoritative payment status & amount
    try {
      const { fetchRazorpayPayment } = await import("@/lib/razorpay/client");
      const razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id);

      if (!razorpayPayment) {
        return NextResponse.json(
          { error: "Payment verification failed: Payment not found on gateway." },
          { status: 400, headers }
        );
      }

      // Verify payment order ID matches payload order ID
      if (razorpayPayment.order_id !== razorpay_order_id) {
        console.error("Payment order mismatch", {
          paymentOrderId: razorpayPayment.order_id,
          payloadOrderId: razorpay_order_id,
        });
        return NextResponse.json(
          { error: "Payment verification failed: Payment does not belong to order." },
          { status: 400, headers }
        );
      }

      // Verify payment status is captured or authorized
      if (razorpayPayment.status !== "captured" && razorpayPayment.status !== "authorized") {
        console.error("Payment status not captured/authorized", { status: razorpayPayment.status });
        return NextResponse.json(
          { error: `Payment status is ${razorpayPayment.status}. Only captured payments are accepted.` },
          { status: 400, headers }
        );
      }
    } catch (rzpErr: any) {
      console.warn("Razorpay API lookup warning during verification:", rzpErr?.message || rzpErr);
      // Fallback to signature check if Razorpay API endpoint is unreachable or env keys in test mode
    }

    // Mark order as paid in database with razorpay_payment_id
    try {
      const supabase = createAdminSupabaseClient();
      
      // 1. Locate order by razorpay_order_id or tracking_token/order_number
      let orderQuery = supabase
        .from("orders")
        .select("id, order_number, status, razorpay_order_id, razorpay_payment_id");

      if (razorpay_order_id) {
        orderQuery = orderQuery.eq("razorpay_order_id", razorpay_order_id);
      } else if (tracking_token) {
        orderQuery = orderQuery.eq("tracking_token", tracking_token);
      } else if (order_number) {
        orderQuery = orderQuery.eq("order_number", order_number);
      }

      const { data: existingOrders, error: fetchErr } = await orderQuery;

      if (fetchErr) {
        console.error("Database fetch error on payment verification:", fetchErr);
        return NextResponse.json(
          { error: "Database error during payment verification" },
          { status: 500, headers }
        );
      }

      const order = existingOrders?.[0];

      if (!order) {
        console.warn("No order found matching payment verification payload", { razorpay_order_id });
        return NextResponse.json(
          { error: "Order not found for verified payment" },
          { status: 404, headers }
        );
      }

      // Idempotency check: if order is already paid/processing, ensure fulfillment & send confirmation email safely
      if (order.status === "paid" || order.status === "processing" || order.status === "shipped" || order.status === "delivered") {
        // Asynchronously ensure fulfillment without blocking response
        processOrderFulfillment(order.id).catch((err) => {
          console.error("Background fulfillment error on verified order:", err);
        });

        // Await order confirmation email send safely without throwing or breaking payment response
        try {
          const emailRes = await sendOrderConfirmationEmail(order.id);
          if (!emailRes.success && !emailRes.skipped) {
            console.warn(`[VerifyPayment] Order confirmation email error for ${order.id}:`, emailRes.error);
          }
        } catch (emailErr) {
          console.error(`[VerifyPayment] Order confirmation email exception for ${order.id}:`, emailErr);
        }

        return NextResponse.json(
          {
            success: true,
            message: "Payment verified (already processed)",
            razorpay_order_id,
            razorpay_payment_id,
          },
          { status: 200, headers }
        );
      }

      // If status is pending_payment, transition to paid
      if (order.status === "pending_payment") {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id)
          .eq("status", "pending_payment");

        if (updateError) {
          console.error("Database update error on payment verification:", updateError);
          return NextResponse.json(
            { error: "Failed to update order payment status" },
            { status: 500, headers }
          );
        }

        // Trigger Shiprocket fulfillment and await completion (safely handles errors internally)
        const fulfillmentRes = await processOrderFulfillment(order.id);
        if (fulfillmentRes.status === "failed") {
          console.warn(
            `[VerifyPayment] Order ${order.id} payment verified, but background fulfillment returned failed:`,
            fulfillmentRes.error
          );
        }

        // Await order confirmation email send safely without throwing or breaking payment response
        try {
          const emailRes = await sendOrderConfirmationEmail(order.id);
          if (!emailRes.success && !emailRes.skipped) {
            console.warn(`[VerifyPayment] Order confirmation email error for ${order.id}:`, emailRes.error);
          }
        } catch (emailErr) {
          console.error(`[VerifyPayment] Order confirmation email exception for ${order.id}:`, emailErr);
        }
      } else if (order.status === "cancelled") {
        // Late payment after order expiration
        await supabase
          .from("orders")
          .update({
            status: "payment_captured_after_expiry",
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
      }
    } catch (dbError) {
      console.error("Database exception on payment verification:", dbError);
      return NextResponse.json(
        { error: "Internal server error verifying payment" },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        razorpay_order_id,
        razorpay_payment_id,
      },
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error verifying payment" },
      { status: 500, headers }
    );
  }
}

