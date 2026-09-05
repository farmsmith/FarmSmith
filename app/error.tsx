"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log sanitized error details internally for observability
    console.error("[Global Error Boundary caught error]:", error?.message || error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "var(--color-background)",
      }}
    >
      <div style={{ maxWidth: "540px", width: "100%" }}>
        <ErrorState
          layout="page"
          title="Something went wrong"
          description="We encountered an unexpected issue while loading this page. Please try refreshing or return to the home page."
          primaryAction={{
            label: "Try Again",
            onClick: () => reset(),
          }}
          secondaryAction={{
            label: "Go to Home",
            href: "/",
          }}
        />
      </div>
    </div>
  );
}
