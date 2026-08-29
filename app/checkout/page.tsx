import { Suspense } from "react";
import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your FarmSmith Foods order securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: "var(--color-background)",
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="skeleton" style={{ width: "300px", height: "1.5rem" }} />
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
