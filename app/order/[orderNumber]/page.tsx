import { Suspense } from "react";
import type { Metadata } from "next";
import OrderConfirmationClient from "./OrderConfirmationClient";
import OrderConfirmationLoading from "./loading";

export const metadata: Metadata = {
  title: "Order Details",
  description: "Your FarmSmith Foods order details and tracking status.",
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
