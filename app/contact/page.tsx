import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Contact Us — Customer Helpline & Inquiry",
  description:
    "Have a question about our GI-tagged turmeric, order status, or bulk/B2B inquiries? Contact FarmSmith Foods team via email, phone, or message.",
  alternates: {
    canonical: "https://www.farmsmithfoods.com/contact",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://www.farmsmithfoods.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Contact Us",
      item: "https://www.farmsmithfoods.com/contact",
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ContactClient />
    </>
  );
}
