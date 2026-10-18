import type { Metadata } from "next";
import TrackClient from "./TrackClient";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your FarmSmith order using your order number and mobile number, email, or tracking key.",
  alternates: {
    canonical: "https://www.farmsmithfoods.com/track",
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
      name: "Track Your Order",
      item: "https://www.farmsmithfoods.com/track",
    },
  ],
};

export default function TrackPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <TrackClient />
    </>
  );
}
