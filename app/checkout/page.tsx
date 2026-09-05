import { Suspense } from "react";
import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import CheckoutLoading from "./loading";

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
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClient />
    </Suspense>
  );
}
