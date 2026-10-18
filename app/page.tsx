import type { Metadata } from "next";
import FeaturedProductShowcase from "@/components/home/FeaturedProductShowcase";
import { getActiveProducts } from "@/lib/data/products";
import PurityShowcase from "@/components/home/PurityShowcase";
import CustomerReviewsSection from "@/components/home/CustomerReviewsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import FaqSection from "@/components/home/FaqSection";
import IntroHeroAnimation from "@/components/home/IntroHeroAnimation";
import HomeHeroSection from "@/components/home/HomeHeroSection";
import GrowingSection from "@/components/home/GrowingSection";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export const metadata: Metadata = {
  title: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
  description:
    "GI-tagged, batch-tested turmeric and organic foods made with complete transparency. Know exactly where your food came from and what happened to it.",
  alternates: {
    canonical: "https://www.farmsmithfoods.com",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does GI-Tag mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Origin Certification: It proves that a product comes from a specific region, town, or state. Quality Assurance: It ensures that the item follows traditional methods and possesses unique traits tied to that local environment. Legal Protection: It stops unauthorized users from using the protected name for fake or non-regional products.",
      },
    },
    {
      "@type": "Question",
      name: "How do you ensure the quality of your product?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We approach quality through multiple stages — from sourcing and selection to processing, packing and batch-level testing. Where a particular quality parameter is tested, the applicable laboratory result is associated with the relevant batch. We prefer showing the evidence behind a claim rather than simply calling a product pure.",
      },
    },
    {
      "@type": "Question",
      name: "Is every FarmSmith batch tested?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Our batches undergo defined quality checks and laboratory testing, with results maintained against the relevant batch records.",
      },
    },
    {
      "@type": "Question",
      name: "What exactly is tested?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We identify parameters such as adulteration, artificial colours/dyes, heavy metals, pesticides/banned pesticides or any other contamination and shelf life. We make the applicable results available for the relevant batch.",
      },
    },
    {
      "@type": "Question",
      name: "Can I check the quality information for my product?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Enter the batch number printed on your FarmSmith pack in our batch-verification section to view the quality information available for that batch.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I find my batch number?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your batch number is printed on the product packaging. Enter that exact number in the Batch Verification section of our website.",
      },
    },
    {
      "@type": "Question",
      name: "Does a GI registration mean the product is pure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. A Geographical Indication primarily identifies goods whose qualities, reputation or characteristics are associated with a particular geographical origin. Only a laboratory test can verify the purity of any product.",
      },
    },
    {
      "@type": "Question",
      name: "Does FarmSmith grow its product?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FarmSmith is a food brand that sources and selects raw materials to its requirements and has them processed and packed to its specifications from entities who share our values of clean nourishing food.",
      },
    },
  ],
};

export default async function HomePage() {
  const products = await getActiveProducts({ limit: 8 });

  // Prioritize the flagship GI-Tagged Kandhamal Turmeric Powder product
  const featuredProduct =
    products.find((p) => p.slug === "turmeric-powder" || p.slug === "kandhamal-turmeric-powder" || p.name.toLowerCase().includes("turmeric")) ??
    products.find((p) => (p.stock_quantity ?? 0) > 0) ??
    products[0] ??
    null;

  return (
    <>
      <JsonLd data={faqJsonLd} />

      {/* ───── 0. INTRO ENTRANCE ANIMATION (3s Brand Showcase) ───── */}
      <IntroHeroAnimation />

      {/* ───── 1. HERO SECTION (With 2.75s forward & backward scroll reveal) ───── */}
      <HomeHeroSection />

      {/* ───── 3. FEATURED PRODUCTS SHOWCASE (Split: Image Left, Content Right) ───── */}
      {featuredProduct && (
        <FeaturedProductShowcase product={featuredProduct} />
      )}

      {/* ───── 4. PURITY & LAB TRANSPARENCY SHOWCASE ───── */}
      <PurityShowcase />

      {/* ───── 6. THE FUTURE OF FARMSMITH (Farmsmith is growing) ───── */}
      <GrowingSection />

      {/* ───── 7. VERIFIED CUSTOMER REVIEWS ───── */}
      <CustomerReviewsSection />

      {/* ───── 8. GLASSMORPHIC NEWSLETTER & COMMUNITY ───── */}
      <NewsletterSection />

      {/* ───── 9. FREQUENTLY ASKED QUESTIONS (ACCORDION) ───── */}
      <FaqSection />
    </>
  );
}
