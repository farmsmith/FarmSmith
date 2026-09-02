import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID required"),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "Cart cannot be empty")
    .max(20, "Too many distinct items in one order"),

  customer: z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Invalid email address").max(320),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, "");
          return digits.length >= 10 && digits.length <= 12;
        },
        "Enter a valid 10-digit phone number"
      ),
  }),

  shippingAddress: z.object({
    line1: z.string().trim().min(1, "Address line 1 is required").max(300),
    line2: z.string().trim().max(300).optional(),
    city: z.string().trim().min(1, "City is required").max(100),
    state: z.string().trim().min(1, "State is required").max(100),
    pincode: z
      .string()
      .trim()
      .refine((val) => /^\d{6}$/.test(val.replace(/\s/g, "")), "Enter a valid 6-digit pincode"),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
