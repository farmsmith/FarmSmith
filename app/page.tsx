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
import { Sparkles, ArrowRight } from "lucide-react";

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
                href="/shop"
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

      {/* ───── 6. THE FUTURE OF FARMSMITH ───── */}
      <section
        style={{
          background: "linear-gradient(140deg, #0E1E16 0%, #162E22 50%, #224434 100%)",
          color: "#FBFAF6",
          paddingBlock: "6rem",
          position: "relative",
          overflow: "hidden",
          borderTop: "1px solid rgba(217, 164, 65, 0.25)",
          borderBottom: "1px solid rgba(217, 164, 65, 0.25)",
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-30%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217, 164, 65, 0.12) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ maxWidth: "1150px", margin: "0 auto", paddingInline: "1rem", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3.5rem", alignItems: "center" }} className="lg:grid-cols-12">

            {/* Text Left */}
            <div className="lg:col-span-7">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(217, 164, 65, 0.12)",
                  border: "1px solid rgba(217, 164, 65, 0.35)",
                  padding: "0.45rem 1.1rem",
                  borderRadius: "100px",
                  marginBottom: "1.25rem",
                  backdropFilter: "blur(6px)",
                }}
              >
                <Sparkles size={15} style={{ color: "#D9A441" }} />
                <span style={{ fontSize: "0.78125rem", fontWeight: 800, color: "#D9A441", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Farmsmith is growing
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                  fontWeight: 700,
                  color: "#FBFAF6",
                  marginBottom: "1.25rem",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                From one origin <br />
                <span style={{ color: "#D9A441", fontStyle: "normal" }}>
                  to many
                </span>
              </h2>

              <p
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.75,
                  color: "rgba(251, 250, 246, 0.88)",
                  marginBottom: "2.25rem",
                  maxWidth: "540px",
                }}
              >
                Kandhamal turmeric is where farmsmith begins. We are building a considered range of everyday foods, each chosen for its origin, quality and story.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <Link
                  href="/shop"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    background: "linear-gradient(135deg, #E2B356 0%, #D9A441 100%)",
                    color: "#12241C",
                    padding: "0.9375rem 2.25rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 800,
                    fontSize: "0.9375rem",
                    textDecoration: "none",
                    boxShadow: "0 6px 20px rgba(217, 164, 65, 0.3)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  Shop Turmeric Today <ArrowRight size={18} />
                </Link>

                <Link
                  href="/shop"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: "1px solid rgba(217, 164, 65, 0.4)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#FBFAF6",
                    padding: "0.9375rem 2rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    textDecoration: "none",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Follow New Releases
                </Link>
              </div>
            </div>

            {/* Teaser Graphics Right - Visible on all devices */}
            <div className="lg:col-span-5 block">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(217, 164, 65, 0.3)",
                    borderRadius: "var(--radius-xl)",
                    padding: "2.25rem 1.35rem",
                    textAlign: "center",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "#D9A441",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      background: "rgba(217, 164, 65, 0.12)",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "100px",
                      display: "inline-block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    UPCOMING
                  </span>
                  <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#FFFFFF", marginBottom: "0.35rem", fontWeight: 700 }}>
                    Cold-Pressed Oils
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(251,250,246,0.7)", margin: 0 }}>
                    Wood-milled purity
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(217, 164, 65, 0.3)",
                    borderRadius: "var(--radius-xl)",
                    padding: "2.25rem 1.35rem",
                    textAlign: "center",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "#D9A441",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      background: "rgba(217, 164, 65, 0.12)",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "100px",
                      display: "inline-block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    UPCOMING
                  </span>
                  <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#FFFFFF", marginBottom: "0.35rem", fontWeight: 700 }}>
                    Grains and pulses
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(251,250,246,0.7)", margin: 0 }}>
                    From where it grows best
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───── 7. VERIFIED CUSTOMER REVIEWS ───── */}
      <CustomerReviewsSection />

      {/* ───── 8. GLASSMORPHIC NEWSLETTER & COMMUNITY ───── */}
      <NewsletterSection />

      {/* ───── 9. FREQUENTLY ASKED QUESTIONS (ACCORDION) ───── */}
      <FaqSection />
    </>
  );
}
