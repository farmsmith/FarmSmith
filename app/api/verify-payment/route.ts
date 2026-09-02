import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400 }
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
        { status: 400 }
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
        { status: 400 }
      );
    }

    // Mark order as paid in database with razorpay_payment_id
    try {
      const supabase = createAdminSupabaseClient();
      
      // Primary update by razorpay_order_id
      let { data: updatedOrders, error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpay_order_id)
        .select("id, order_number, status, razorpay_payment_id");

      // Fallback: If 0 rows updated, search by tracking_token or order_number
      if ((!updatedOrders || updatedOrders.length === 0) && (tracking_token || order_number)) {
        console.warn("No order matched by razorpay_order_id. Trying fallback by tracking_token / order_number...", {
          razorpay_order_id,
          order_number,
          tracking_token,
        });

        let fallbackQuery = supabase.from("orders").update({
          status: "paid",
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        });

        if (tracking_token) {
          fallbackQuery = fallbackQuery.eq("tracking_token", tracking_token);
        } else if (order_number) {
          fallbackQuery = fallbackQuery.eq("order_number", order_number);
        }

        const fallbackRes = await fallbackQuery.select("id, order_number, status, razorpay_payment_id");
        updatedOrders = fallbackRes.data;
        updateError = fallbackRes.error;
      }

      if (updateError) {
        console.error("Database update error on payment verification:", updateError);
      } else {
        console.log("Supabase payment verification DB update successful:", updatedOrders);
      }
    } catch (dbError) {
      console.error("Database exception on payment verification:", dbError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        razorpay_order_id,
        razorpay_payment_id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error verifying payment" },
      { status: 500 }
    );
  }
}
