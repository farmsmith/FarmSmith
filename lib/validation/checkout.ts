import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "Cart cannot be empty")
    .max(20, "Too many distinct items in one order"),

  customer: z.object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    // Basic Indian phone check — 10 digits, optional +91 prefix.
    // Loosened slightly to also accept spaces/dashes the user might type.
    phone: z
      .string()
      .trim()
      .regex(/^(\+91[-\s]?)?[6-9]\d{9}$/, "Enter a valid Indian phone number"),
  }),

  shippingAddress: z.object({
    line1: z.string().trim().min(1).max(300),
    line2: z.string().trim().max(300).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
