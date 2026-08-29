import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies the Razorpay WEBHOOK signature. This is the authoritative
 * source of truth for "payment succeeded" — never trust a client-side
 * callback claiming success on its own.
 *
 * Docs: https://razorpay.com/docs/webhooks/validate-test/
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  // Constant-time comparison to avoid timing attacks
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Verifies the signature Razorpay's checkout widget returns to the
 * browser after payment, which the browser then forwards to our server.
 * This is a useful early check, but the WEBHOOK is what actually marks
 * an order as paid — this function alone is not sufficient trust.
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(params.razorpaySignature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}
