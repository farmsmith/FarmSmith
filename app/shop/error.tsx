"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

interface ShopErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ShopErrorProps) {
  useEffect(() => {
    console.error("[Shop Route Error caught]:", error?.message || error);
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
          title="Could not load products"
          description="We had trouble retrieving our catalog of organic farm products. Please try again."
          primaryAction={{
            label: "Try Again",
            onClick: () => reset(),
          }}
          secondaryAction={{
            label: "Return Home",
            href: "/",
          }}
        />
      </div>
    </div>
  );
}
