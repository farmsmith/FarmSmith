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

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export const metadata: Metadata = {
  title: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
  description:
    "GI-tagged, batch-tested turmeric and organic foods made with complete transparency. Know exactly where your food came from and what happened to it.",
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
