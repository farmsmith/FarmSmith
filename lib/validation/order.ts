import { z } from "zod";

/** Tracking an order requires BOTH the order number and its high-entropy
 * tracking token — never just the (guessable) order number alone. */
export const orderTrackingSchema = z.object({
  orderNumber: z.string().trim().min(1).max(50),
  trackingToken: z.string().trim().min(20).max(200),
});

export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>;
