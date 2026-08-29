import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import TrustTicker from "@/components/home/TrustTicker";
import PurityShowcase from "@/components/home/PurityShowcase";
import CustomerReviewsSection from "@/components/home/CustomerReviewsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import FaqSection from "@/components/home/FaqSection";
import { ShieldCheck, Award, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
  description:
    "GI-tagged, batch-tested turmeric and organic foods made with complete transparency. Know exactly where your food came from and what happened to it.",
};

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  
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
          minHeight: "calc(100dvh - 68px)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          paddingBlock: "4rem 4rem",
        }}
      >
        {/* Background Image */}
        <Image
          src="/images/hero_groceries.png"
          alt="Fresh organic groceries, spices, pulses, and wholesome farm produce"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
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

        <div className="container" style={{ position: "relative", zIndex: 2, maxWidth: "1150px", margin: "0 auto", paddingInline: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem", alignItems: "center" }} className="lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              {/* Trust Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(217, 164, 65, 0.15)",
                  border: "1px solid rgba(217, 164, 65, 0.4)",
                  padding: "0.4rem 1rem",
                  borderRadius: "100px",
                  marginBottom: "1.25rem",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Sparkles size={16} style={{ color: "#D9A441" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#D9A441", letterSpacing: "0.03em" }}>
                  100% GI-Tagged &bull; Batch-Lab Tested
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                  color: "#FBFAF6",
                  marginBottom: "1.25rem",
                  lineHeight: 1.12,
                  letterSpacing: "-0.02em",
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
                We started because we couldn't find spices and organic food we trusted enough for our own family. 
                Every batch is lab-tested and every ingredient traced directly to its GI-tagged origin.
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
                  Explore Organic Shop <ArrowRight size={18} />
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

            {/* Right Hero Feature Badge / Floating Lab Stats */}
            <div className="lg:col-span-5 hidden lg:block">
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  borderRadius: "var(--radius-xl)",
                  padding: "2rem",
                  color: "#FFFFFF",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Award size={28} style={{ color: "#D9A441" }} />
                  <div>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", color: "#FFFFFF", margin: 0 }}>
                      Kandhamal GI Turmeric
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>Geographical Indication Registry #610</span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(255,255,255,0.15)" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.875rem", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#D9A441", fontWeight: 700, display: "block" }}>CURCUMIN CONTENT</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>5.42%</span>
                    <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.6)", display: "block" }}>High Potency Verified</span>
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.875rem", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700, display: "block" }}>HEAVY METALS</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>0.00%</span>
                    <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.6)", display: "block" }}>Zero Lead Chromate</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(251,250,246,0.85)" }}>
                  <ShieldCheck size={16} style={{ color: "#D9A441" }} />
                  Third-party lab tested per individual batch.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───── 2. TRUST TICKER MARQUEE ───── */}
      <TrustTicker />

      {/* ───── 3. FEATURED PRODUCTS SHOWCASE ───── */}
      {featuredProduct && (
        <section
          className="section"
          aria-labelledby="featured-heading"
          style={{ background: "var(--color-background)", paddingBlock: "4rem" }}
        >
          <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem" }}>
                Our Featured Harvest
              </p>
              <h2
                id="featured-heading"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  color: "var(--color-primary)",
                }}
              >
                Start with <span style={{ color: "#C4883E" }}>The Gold Standard</span>
              </h2>
            </div>

            <div style={{ maxWidth: "380px", margin: "0 auto" }}>
              <ProductCard product={featuredProduct} />
            </div>

            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link
                href="/shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  background: "linear-gradient(135deg, #E2B356 0%, #D9A441 100%)",
                  color: "#1F3A2E",
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  padding: "0.9375rem 2.25rem",
                  borderRadius: "999px",
                  boxShadow: "0 6px 20px rgba(217, 164, 65, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                View Complete Organic Collection <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
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
                  THE FUTURE OF FARMSMITH
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
                This is only <br />
                <span style={{ color: "#D9A441", fontStyle: "normal" }}>
                  the beginning.
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
                Turmeric is our first product. We are actively developing a wider range of essential household foods — each built on verified sourcing, batch transparency, and uncompromised purity.
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

            {/* Teaser Graphics Right */}
            <div className="lg:col-span-5 hidden lg:block">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
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
                    Raw Forest Honey
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(251,250,246,0.7)", margin: 0 }}>
                    Unfiltered & wild
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
