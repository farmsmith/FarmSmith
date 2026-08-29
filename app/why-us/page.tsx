import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Award, Leaf, Search, Truck, HeartHandshake, ArrowRight, Sparkles, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Why FarmSmith — Our Purity & Sourcing Promise",
  description:
    "Discover why FarmSmith Foods offers India's most trustworthy, 100% pure, GI-tagged turmeric and organic spices. Pure origin, zero adulteration.",
};

const PILLARS = [
  {
    icon: Award,
    title: "Geographical Indication (GI) Tagged",
    description:
      "Our turmeric is cultivated exclusively in GI-certified soil—renowned globally for its superior natural curcumin levels and distinctive aroma.",
    highlight: "Kandhamal GI Registry #610",
  },
  {
    icon: ShieldCheck,
    title: "0% Adulteration Guarantee",
    description:
      "Every batch is rigorously tested by NABL-accredited independent laboratories. Free from lead chromate, metanil yellow, chalk powder, and artificial coloring agents.",
    highlight: "NABL Lab Cleared",
  },
  {
    icon: Leaf,
    title: "High Bio-Active Curcumin (5% - 6%+)",
    description:
      "Naturally containing 5% to 6.2% active curcumin (compared to standard 1.5–2% store turmeric), providing maximum wellness, anti-inflammatory, and immunity benefits.",
    highlight: "3x Market Potency",
  },
  {
    icon: Search,
    title: "Complete Batch Traceability",
    description:
      "Scan the QR code or enter your batch code on any FarmSmith pack to instantly view the exact lab report, harvest date, and origin details.",
    highlight: "QR Code on Package",
  },
  {
    icon: HeartHandshake,
    title: "Direct-from-Farmer Partnerships",
    description:
      "By removing middlemen, we pay fair premium prices directly to smallholder organic farmers, nurturing sustainable soil health and farming communities.",
    highlight: "Fair Trade Certified",
  },
  {
    icon: Truck,
    title: "Hygienic & Fresh Sealed",
    description:
      "Cleaned, sun-dried, cold-milled to preserve volatile essential oils, and vacuum-sealed in food-grade eco pouches to lock in freshness from farm to your kitchen.",
    highlight: "Cold-Milled Freshness",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Source",
    desc: "Single-origin turmeric roots selected from certified GI-tagged agricultural belts.",
  },
  {
    step: "02",
    title: "Process",
    desc: "Traditional sun-drying and controlled milling to preserve natural curcumin and aroma.",
  },
  {
    step: "03",
    title: "Test",
    desc: "Independent lab testing per batch for heavy metals, pesticides, and purity safety.",
  },
  {
    step: "04",
    title: "Pack",
    desc: "Hygienically sealed in protective pouches to lock in natural freshness and essential oils.",
  },
  {
    step: "05",
    title: "Your Table",
    desc: "Delivered to your doorstep with total peace of mind for your whole family.",
  },
];

export default function WhyUsPage() {
  return (
    <div style={{ background: "var(--color-background)", minHeight: "85vh" }}>
      
      {/* ───── 1. HERO BANNER ───── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1C3121 0%, #2A4832 100%)",
          color: "#FBFAF6",
          paddingBlock: "5rem 4.5rem",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: "840px", margin: "0 auto", paddingInline: "1rem" }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "#D9A441",
              display: "block",
              marginBottom: "0.75rem",
            }}
          >
            The FarmSmith Guarantee
          </span>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              fontWeight: 700,
              marginBottom: "1.25rem",
              lineHeight: 1.15,
              color: "#FFFFFF",
            }}
          >
            Why Choose <span style={{ color: "#D9A441" }}>FarmSmith Foods?</span>
          </h1>

          <p
            style={{
              color: "rgba(251, 250, 246, 0.88)",
              fontSize: "1.125rem",
              lineHeight: 1.75,
              maxWidth: "680px",
              margin: "0 auto 2.25rem",
            }}
          >
            In a market flooded with chemically polished and artificially colored spices, FarmSmith stands for uncompromised purity, radical batch transparency, and authentic Indian farm heritage.
          </p>

          <div style={{ display: "flex", justifyContent: "center" }}>
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
                fontWeight: 800,
                fontSize: "0.9375rem",
                textDecoration: "none",
                boxShadow: "0 8px 25px rgba(217, 164, 65, 0.35)",
              }}
            >
              Explore Organic Collection <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───── 3. CORE 6 PILLARS OF TRUST ───── */}
      <section className="container" style={{ maxWidth: "1150px", margin: "0 auto", paddingInline: "1rem", paddingBlock: "5rem 4.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3.5rem" }}>
          <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "0.1em" }}>
            UNCOMPROMISING QUALITY
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              color: "var(--color-primary)",
              lineHeight: 1.2,
              marginBottom: "0.875rem",
              letterSpacing: "-0.02em",
            }}
          >
            Built On Unshakeable Trust
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
            Six core principles that guarantee every FarmSmith product in your home is authentic, pure, and rich in natural nutrients.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-xl)",
                  padding: "2.25rem 2rem",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 8px 25px rgba(31, 58, 46, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      background: "rgba(196, 136, 62, 0.12)",
                      border: "1px solid rgba(196, 136, 62, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#C4883E",
                    }}
                  >
                    <Icon size={25} />
                  </div>

                  <span
                    style={{
                      background: "rgba(196, 136, 62, 0.1)",
                      color: "#C4883E",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.3rem 0.75rem",
                      borderRadius: "100px",
                      border: "1px solid rgba(196, 136, 62, 0.2)",
                    }}
                  >
                    {pillar.highlight}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.25rem",
                    color: "var(--color-primary)",
                    marginBottom: "0.75rem",
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  {pillar.title}
                </h3>

                <p
                  style={{
                    color: "var(--color-muted)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───── 4. THE 5-STEP FARM-TO-KITCHEN TIMELINE (DARK GLASSMORPHIC THEME) ───── */}
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
        {/* Subtle Ambient Glow */}
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

        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", paddingInline: "1rem", position: "relative", zIndex: 2 }}>
          
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 4rem" }}>
            <p className="eyebrow" style={{ color: "#D9A441", marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "0.1em" }}>
              FARM TO KITCHEN PROCESS
            </p>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#FFFFFF",
                lineHeight: 1.2,
                marginBottom: "0.875rem",
                letterSpacing: "-0.02em",
              }}
            >
              From Farm to <span style={{ color: "#D9A441" }}>Your Kitchen</span>
            </h2>
            <p style={{ color: "rgba(251, 250, 246, 0.88)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
              We believe you should be able to trace every step your spice takes before it arrives in your home.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "1.5rem",
              position: "relative",
            }}
          >
            {STEPS.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-xl)",
                  padding: "2.25rem 1.75rem",
                  border: "1px solid rgba(217, 164, 65, 0.35)",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "#FFFBF0",
                      border: "1.5px solid #D9A441",
                      color: "#B37E14",
                      fontWeight: 800,
                      fontSize: "1rem",
                      boxShadow: "0 2px 8px rgba(217, 164, 65, 0.2)",
                    }}
                  >
                    {item.step}
                  </div>
                  {index < 4 && (
                    <span style={{ fontSize: "1.35rem", color: "#D9A441", fontWeight: 700 }}>&rarr;</span>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.25rem",
                    color: "var(--color-primary)",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.90625rem",
                    color: "#4A5D50",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───── 5. WARM CREAM GOLD ACCENT CALL TO ACTION (DISTINCT FROM GREEN FOOTER) ───── */}
      <section className="container" style={{ maxWidth: "960px", margin: "0 auto", paddingInline: "1rem", paddingBlock: "5.5rem 6rem" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #FFFDF9 0%, #FAF3E6 100%)",
            color: "var(--color-primary)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(2.75rem, 5vw, 4.5rem)",
            textAlign: "center",
            border: "1.5px solid rgba(217, 164, 65, 0.4)",
            boxShadow: "0 20px 50px rgba(31, 58, 46, 0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(196, 136, 62, 0.12)",
              border: "1px solid rgba(196, 136, 62, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C4883E",
              margin: "0 auto 1.75rem",
              boxShadow: "0 4px 16px rgba(196, 136, 62, 0.15)",
            }}
          >
            <FileText size={30} />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              color: "var(--color-primary)",
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            Experience True <span style={{ color: "#C4883E" }}>Farm Purity</span>
          </h2>

          <p style={{ color: "var(--color-muted)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "600px", margin: "0 auto 2.5rem" }}>
            Taste the difference of authentic, high-curcumin Kandhamal turmeric and organic farm produce delivered straight to your home.
          </p>

          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "var(--color-primary)",
              color: "#FFFFFF",
              padding: "1.05rem 2.65rem",
              borderRadius: "999px",
              fontWeight: 800,
              fontSize: "0.9375rem",
              textDecoration: "none",
              boxShadow: "0 10px 25px rgba(31, 58, 46, 0.25)",
              transition: "transform 0.2s ease, boxShadow 0.2s ease",
            }}
          >
            Explore Our Organic Shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
