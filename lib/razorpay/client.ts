import "server-only";
import Razorpay from "razorpay";

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Missing NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars."
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Creates a Razorpay order and includes the internal order UUID in notes so
 * a webhook can still reconcile the payment even in the tiny race where the
 * webhook arrives before razorpay_order_id is persisted locally. */
export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string,
  internalOrderId: string
) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
    notes: {
      farmsmith_order_id: internalOrderId,
      farmsmith_order_number: receipt,
    },
  });
}
