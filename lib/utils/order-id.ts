import "server-only";
import { randomBytes } from "crypto";

/** Generates a customer-facing order number like FS-2026-4F9A2C.
 * Not guaranteed globally unique on its own — the DB's `unique`
 * constraint on order_number is the real guarantee; on the rare
 * collision, retry generation. */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(3).toString("hex").toUpperCase(); // 6 hex chars
  return `FS-${year}-${suffix}`;
}

/** Generates a high-entropy (256-bit) URL-safe tracking token.
 * Required alongside the order number to view order status — an
 * order number alone must never be sufficient to see customer data. */
export function generateTrackingToken(): string {
  return randomBytes(32).toString("base64url");
}
