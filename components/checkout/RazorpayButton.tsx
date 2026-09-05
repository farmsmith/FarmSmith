"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/states";
import type { CheckoutResponse } from "@/types/payment";
import type { CartItem } from "@/lib/cart/types";

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
    Razorpay: new (options: RazorpayOptions) => {
      open(): void;
      on?(event: string, handler: (response: any) => void): void;
    };
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
  const autoOpened = useRef(false);

  const handlePay = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Could not load payment gateway. Check your connection and try again.");
        setLoading(false);
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
        handler: async (response) => {
          try {
            setLoading(true);
            // Verify payment signature on backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_number: checkoutData.orderNumber,
                tracking_token: checkoutData.trackingToken,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              onSuccess(checkoutData.orderNumber, checkoutData.trackingToken);
            } else {
              setError(verifyData.error || "Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch {
            setError("Network error while verifying payment. Please contact support.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onDismiss?.();
          },
        },
      };

      const rzp = new window.Razorpay(options);

      if (typeof rzp.on === "function") {
        rzp.on("payment.failed", (response: any) => {
          console.error("Razorpay Payment Failed:", response.error);
          setError(`Payment Failed: ${response.error?.description || "Transaction was declined."}`);
          setLoading(false);
        });
      }

      rzp.open();
    } catch {
      setError("Something went wrong opening the payment window. Please try again.");
      setLoading(false);
    }
  }, [checkoutData, customerEmail, customerName, customerPhone, onSuccess, onDismiss]);

  useEffect(() => {
    if (!autoOpened.current) {
      autoOpened.current = true;
      void handlePay();
    }
  }, [handlePay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {error && (
        <ErrorState
          layout="inline"
          title="Payment notice"
          description={error}
          role="alert"
          ariaLive="assertive"
        />
      )}
      <Button
        variant="accent"
        size="lg"
        onClick={handlePay}
        loading={loading}
        disabled={loading}
        style={{ width: "100%", fontSize: "1rem" }}
        id="razorpay-pay-btn"
        aria-label={loading ? "Opening secure payment gateway..." : "Pay Securely"}
      >
        {loading ? "Opening Gateway..." : "Pay Securely"}
      </Button>
      <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", textAlign: "center" }}>
        Powered by Razorpay. Your payment info is never stored on our servers.
      </p>
    </div>
  );
}
