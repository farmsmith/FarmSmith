"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

interface CheckoutErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CheckoutError({ error, reset }: CheckoutErrorProps) {
  useEffect(() => {
    console.error("[Checkout Route Error caught]:", error?.message || error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        background: "var(--color-background)",
      }}
    >
      <div style={{ maxWidth: "540px", width: "100%" }}>
        <ErrorState
          layout="section"
          title="Checkout interrupted"
          description="We encountered an issue preparing your checkout session. Your cart items have been preserved."
          primaryAction={{
            label: "Try Again",
            onClick: () => reset(),
          }}
          secondaryAction={{
            label: "Return to Cart",
            href: "/shop",
          }}
        />
      </div>
    </div>
  );
}
