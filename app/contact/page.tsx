import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — Customer Helpline & Inquiry",
  description:
    "Have a question about our GI-tagged turmeric, order status, or bulk/B2B inquiries? Contact FarmSmith Foods team via email, phone, or message.",
};

export default function ContactPage() {
  return <ContactClient />;
}
