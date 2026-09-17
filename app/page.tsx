import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FeaturedProductShowcase from "@/components/home/FeaturedProductShowcase";
import type { Product } from "@/types/product";
import { getActiveProducts } from "@/lib/data/products";
import TrustTicker from "@/components/home/TrustTicker";
import PurityShowcase from "@/components/home/PurityShowcase";
import CustomerReviewsSection from "@/components/home/CustomerReviewsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import FaqSection from "@/components/home/FaqSection";
import IntroHeroAnimation from "@/components/home/IntroHeroAnimation";
import GrowingSection from "@/components/home/GrowingSection";
import { ArrowRight } from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export const metadata: Metadata = {
  title: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
  description:
    "GI-tagged, batch-tested turmeric and organic foods made with complete transparency. Know exactly where your food came from and what happened to it.",
};

export default async function HomePage() {
  const products = await getActiveProducts();

  // Prioritize the flagship GI-Tagged Kandhamal Turmeric Powder product
  const featuredProduct =
    products.find((p) => p.slug === "kandhamal-turmeric-powder" || p.name.toLowerCase().includes("turmeric")) ??
    products.find((p) => !p.is_upcoming && (p.stock_quantity ?? 0) > 0) ??
    products[0] ??
    null;

  return (
    <>
      {/* ───── 0. INTRO ENTRANCE ANIMATION (3s Brand Showcase) ───── */}
      <IntroHeroAnimation />

      {/* ───── 1. HERO SECTION ───── */}
      <section
        aria-label="Hero"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "calc(100dvh - 4.25rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          paddingTop: "2.5rem",
        }}
      >
        {/* Background Image */}
        <Image
          src="/images/hero_groceries.png"
          alt="Fresh organic groceries, spices, pulses, and wholesome farm produce"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 60%" }}
        />

        {/* Ambient Dark Gradient Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(23, 45, 35, 0.94) 0%, rgba(31, 58, 46, 0.75) 55%, rgba(31, 58, 46, 0.45) 100%)",
          }}
        />

        {/* Hero Content */}
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1150px",
            margin: "0 auto",
            paddingInline: "1rem",
            flex: 1,
            display: "flex",
            alignItems: "center",
            paddingBottom: "2rem",
          }}
        >
          <div style={{ maxWidth: "680px" }}>
            {/* Trust Eyebrow */}
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "#D9A441",
                letterSpacing: "0.08em",
                marginBottom: "1rem",
              }}
            >
              SINGLE ORIGIN &bull; BATCH TESTED &bull; TRACEABLE
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif-brand)",
                fontSize: "clamp(2.35rem, 5.2vw, 4rem)",
                fontWeight: 700,
                color: "#FBFAF6",
                marginBottom: "1.25rem",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              Food crafted with{" "}
              <span style={{ color: "#D9A441", fontStyle: "normal" }}>
                a mother's care
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.7,
                color: "rgba(251, 250, 246, 0.9)",
                marginBottom: "2.5rem",
                maxWidth: "560px",
              }}
            >
              Carefully sourced foods from where they grow best, Batch Tested for quality and made easier to trust — one batch at a time.
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <Link
                href="/#featured-harvest"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  background: "#D9A441",
                  color: "#1F3A2E",
                  padding: "0.9375rem 2.25rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(217, 164, 65, 0.3)",
                  transition: "transform 0.15s ease, background 0.15s ease",
                }}
              >
                Explore the Shop <ArrowRight size={18} />
              </Link>

              <Link
                href="/track"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1.5px solid rgba(251, 250, 246, 0.5)",
                  color: "#FBFAF6",
                  padding: "0.9375rem 2rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  backdropFilter: "blur(4px)",
                  transition: "background 0.15s ease",
                }}
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>

        {/* ───── 2. TRUST TICKER MARQUEE (Integrated at bottom of Hero) ───── */}
        <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
          <TrustTicker />
        </div>
      </section>

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
