import { z } from "zod";

/**
 * Tracking an order requires the order number and a verification identifier
 * (customer phone number, email address, or tracking token).
 */
export const orderTrackingSchema = z.object({
  orderNumber: z.string().trim().min(1).max(50),
  identifier: z.string().trim().min(3).max(200).optional(),
  trackingToken: z.string().trim().min(3).max(200).optional(),
  phoneOrEmail: z.string().trim().min(3).max(200).optional(),
}).refine((data) => Boolean(data.identifier || data.trackingToken || data.phoneOrEmail), {
  message: "Verification identifier (phone, email, or tracking token) is required",
  path: ["identifier"],
});

export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>;

