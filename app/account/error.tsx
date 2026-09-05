"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

interface AccountErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AccountError({ error, reset }: AccountErrorProps) {
  useEffect(() => {
    console.error("[Account Route Error caught]:", error?.message || error);
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
          title="Account unavailable"
          description="We couldn't retrieve your account information right now. Please try again."
          primaryAction={{
            label: "Try Again",
            onClick: () => reset(),
          }}
          secondaryAction={{
            label: "Browse Shop",
            href: "/shop",
          }}
        />
      </div>
    </div>
  );
}
