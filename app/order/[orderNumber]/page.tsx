import { Suspense } from "react";
import type { Metadata } from "next";
import OrderConfirmationClient from "./OrderConfirmationClient";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your FarmSmith Foods order confirmation and tracking.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="skeleton" style={{ width: "300px", height: "1.5rem" }} />
        </div>
      }
    >
      <OrderConfirmationClient />
    </Suspense>
  );
}
