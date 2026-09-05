"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

interface OrderErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrderError({ error, reset }: OrderErrorProps) {
  useEffect(() => {
    console.error("[Order Route Error caught]:", error?.message || error);
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
          title="Could not load order"
          description="We had trouble retrieving this order's confirmation details. Please try again or check your email."
          primaryAction={{
            label: "Try Again",
            onClick: () => reset(),
          }}
          secondaryAction={{
            label: "Track Another Order",
            href: "/track",
          }}
        />
      </div>
    </div>
  );
}
