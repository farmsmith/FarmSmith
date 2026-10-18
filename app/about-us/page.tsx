import type { Metadata } from "next";
import AboutUsClient from "./AboutUsClient";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Our Story & Purpose — Soil, Origin & Heritage | FarmSmith Foods",
  description:
    "Discover the FarmSmith Foods journey: from questioning supermarket food purity to partnering directly with organic Indian farmers for batch-tested, GI-tagged produce.",
  alternates: {
    canonical: "https://www.farmsmithfoods.com/about-us",
  },
  openGraph: {
    title: "Our Story & Purpose — Soil, Origin & Heritage | FarmSmith Foods",
    description:
      "Discover the FarmSmith Foods journey: from questioning supermarket food purity to partnering directly with organic Indian farmers for batch-tested, GI-tagged produce.",
    url: "https://www.farmsmithfoods.com/about-us",
    type: "website",
    images: [
      {
        url: "https://www.farmsmithfoods.com/images/Our%20story%201.PNG",
        alt: "FarmSmith Foods — Our Story and Purpose",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Story & Purpose — Soil, Origin & Heritage | FarmSmith Foods",
    description:
      "Discover the FarmSmith Foods journey: from questioning supermarket food purity to partnering directly with organic Indian farmers for batch-tested, GI-tagged produce.",
    images: ["https://www.farmsmithfoods.com/images/Our%20story%201.PNG"],
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
      name: "About Us",
      item: "https://www.farmsmithfoods.com/about-us",
    },
  ],
};

export default function AboutUsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <AboutUsClient />
    </>
  );
}

