import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your past and current FarmSmith orders.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountOrdersPage() {
  return <OrdersClient />;
}
