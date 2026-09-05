import { Suspense } from "react";
import type { Metadata } from "next";
import OrderConfirmationClient from "./OrderConfirmationClient";
import OrderConfirmationLoading from "./loading";

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
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationClient />
    </Suspense>
  );
}
