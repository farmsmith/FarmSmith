"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CheckoutResponse } from "@/types/payment";
import type { CartItem } from "@/lib/cart/types";

// Type for Razorpay options — declared locally to avoid external type dep
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

interface RazorpayButtonProps {
  checkoutData: CheckoutResponse;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cartItems: CartItem[];
  onSuccess: (orderNumber: string, trackingToken: string) => void;
  onDismiss?: () => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function RazorpayButton({
  checkoutData,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onDismiss,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Could not load payment gateway. Check your connection and try again.");
        return;
      }

      const options: RazorpayOptions = {
        key: checkoutData.razorpayKeyId,
        amount: checkoutData.amount, // already in paise from API
        currency: checkoutData.currency,
        order_id: checkoutData.razorpayOrderId,
        name: "FarmSmith Foods",
        description: "Organic food order",
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#1F3A2E",
        },
        handler: () => {
          // Razorpay handler fires on payment completion.
          // The webhook has already (or will) confirm the payment server-side.
          // We redirect to the order page using the data we already have.
          onSuccess(checkoutData.orderNumber, checkoutData.trackingToken);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onDismiss?.();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Something went wrong opening the payment window. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {error && (
        <div
          role="alert"
          style={{
            background: "var(--color-error-bg)",
            border: "1px solid var(--color-error)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            color: "var(--color-error)",
          }}
        >
          {error}
        </div>
      )}
      <Button
        variant="accent"
        size="lg"
        onClick={handlePay}
        loading={loading}
        style={{ width: "100%", fontSize: "1rem" }}
        id="razorpay-pay-btn"
      >
        Pay Securely
      </Button>
      <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", textAlign: "center" }}>
        Powered by Razorpay. Your payment info is never stored on our servers.
      </p>
    </div>
  );
}
