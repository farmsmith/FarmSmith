import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay/client";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.amount !== "number") {
      return NextResponse.json(
        { error: "Invalid request payload. Amount (in paise) is required." },
        { status: 400 }
      );
    }

    const { amount, currency = "INR", receipt = `rcpt_${Date.now()}` } = body;

    // STEP 1 Validation: Minimum amount 100 paise (₹1.00)
    if (amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    let razorpay;
    try {
      razorpay = getRazorpayClient();
    } catch (authError: any) {
      console.error("Razorpay authentication configuration error:", authError);
      return NextResponse.json(
        { error: "Razorpay credentials not configured or unauthorized." },
        { status: 401 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: String(receipt),
      notes: {
        created_via: "api/create-order",
      },
    });

    return NextResponse.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
