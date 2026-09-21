import type { Metadata } from "next";
import TrackClient from "./TrackClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your FarmSmith order using your order number and mobile number, email, or tracking key.",
};

export default function TrackPage() {
  return <TrackClient />;
}
