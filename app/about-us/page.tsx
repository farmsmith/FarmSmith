import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Food Crafted with a Mother's Care",
  description:
    "Learn about FarmSmith Foods' mission to bring unadulterated, GI-tagged Indian spices directly from organic farms to kitchens across India.",
};

const VALUES = [
  "100% Traceability from farm patch to kitchen jar",
  "Zero synthetic adulterants, dyes, or heavy metal contamination",
  "Direct fair-trade partnership with native farming communities",
  "Traditional sun-drying and low-temperature cold milling",
];

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "The Question",
    desc: "A mother questions what actually goes into the daily food served to her children — and realizes how hard it is to get honest, verified answers.",
  },
  {
    step: "02",
    title: "The Search",
    desc: "Uncovering supply chain gaps, lack of batch testing, and unverified claims across everyday Indian kitchen spices.",
  },
  {
    step: "03",
    title: "The First Product",
    desc: "Launching FarmSmith Turmeric — GI-tagged, batch-tested, and transparent from origin to packing.",
  },
  {
    step: "04",
    title: "The Mission",
    desc: "Building a community on Instagram around food awareness, pesticide education, and conscious choices for families.",
  },
  {
    step: "05",
    title: "What's Next",
    desc: "Expanding thoughtfully into more household food staples with the same motherly care and strict testing standards.",
  },
];

export default function AboutUsPage() {
  return (
    <div style={{ background: "var(--color-background)", minHeight: "85vh" }}>
      {/* Hero Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #1C3121 0%, #2A4832 100%)",
          color: "#FBFAF6",
          paddingBlock: "5rem 4.5rem",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: "800px" }}>
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
            Our Story & Mission
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
            Rooted in Soil, <br /> Committed to Purity
          </h1>
          <p
            style={{
              color: "rgba(251, 250, 246, 0.88)",
              fontSize: "1.125rem",
              lineHeight: 1.7,
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            FarmSmith Foods was born with a single-minded goal: 
            <br />Restoring honesty to Indian spices through certified origin, sustainable farming, and lab-proven purity.
          </p>
        </div>
      </section>

      {/* Main Story Content */}
      <section className="container" style={{ paddingBlock: "4.5rem 5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3.5rem",
            alignItems: "center",
            marginBottom: "5rem",
          }}
        >
          {/* Text Content */}
          <div>
            <span className="eyebrow" style={{ marginBottom: "0.5rem", color: "#C4883E" }}>
              The Origin Story
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                color: "var(--color-primary)",
                marginBottom: "1.25rem",
                lineHeight: 1.2,
              }}
            >
              Why We Started FarmSmith Foods
            </h2>
            <p
              style={{
                color: "var(--color-muted)",
                fontSize: "1rem",
                lineHeight: 1.75,
                marginBottom: "1rem",
              }}
            >
              Modern commercial spice supply chains are plagued with adulteration—metanil yellow, lead chromate, chalk powder, and exhausted residues where natural essential oils have been extracted.
            </p>
            <p
              style={{
                color: "var(--color-muted)",
                fontSize: "1rem",
                lineHeight: 1.75,
                marginBottom: "1.5rem",
              }}
            >
              We established FarmSmith Foods to bridge the gap between heritage farmers cultivating GI-tagged heirloom crops and health-conscious families who deserve uncompromised nutrition.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
              {VALUES.map((item, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.9375rem", color: "var(--color-foreground)" }}>
                  <CheckCircle2 size={20} style={{ color: "#C4883E", flexShrink: 0, marginTop: "2px" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              aspectRatio: "4/3",
              maxWidth: "500px",
              width: "100%",
              margin: "0 auto",
              boxShadow: "0 15px 35px rgba(31, 58, 46, 0.15)",
            }}
          >
            <Image
              src="/images/origin_story.png"
              alt="FarmSmith heritage turmeric farming"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Stats Strip */}
        <div
          style={{
            background: "#162E22",
            color: "#FBFAF6",
            borderRadius: "var(--radius-xl)",
            padding: "3rem 2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            textAlign: "center",
            border: "1px solid rgba(217, 164, 65, 0.25)",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.75rem", fontWeight: 700, color: "#D9A441" }}>
              100%
            </div>
            <div style={{ fontSize: "0.9375rem", color: "rgba(251,250,246,0.85)", marginTop: "0.25rem" }}>
              GI Tagged Origin
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.75rem", fontWeight: 700, color: "#D9A441" }}>
              5.5%+
            </div>
            <div style={{ fontSize: "0.9375rem", color: "rgba(251,250,246,0.85)", marginTop: "0.25rem" }}>
              Natural Curcumin Content
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.75rem", fontWeight: 700, color: "#D9A441" }}>
              0%
            </div>
            <div style={{ fontSize: "0.9375rem", color: "rgba(251,250,246,0.85)", marginTop: "0.25rem" }}>
              Dyes or Fillers
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.75rem", fontWeight: 700, color: "#D9A441" }}>
              NABL
            </div>
            <div style={{ fontSize: "0.9375rem", color: "rgba(251,250,246,0.85)", marginTop: "0.25rem" }}>
              Batch Lab Certified
            </div>
          </div>
        </div>
      </section>

      {/* ───── BRAND PHILOSOPHY: THE FARMSMITH JOURNEY ───── */}
      <section style={{ background: "var(--color-surface)", paddingBlock: "5.5rem" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", paddingInline: "1rem" }}>
          
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 4rem" }}>
            <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "0.1em" }}>
              BRAND PHILOSOPHY
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
              The FarmSmith Journey
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
              From a mother's question to a movement for food transparency.
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
            {JOURNEY_STEPS.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-xl)",
                  padding: "2.25rem 1.75rem",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 10px 30px rgba(31, 58, 46, 0.05)",
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
                      background: "var(--color-primary)",
                      color: "#D9A441",
                      fontWeight: 800,
                      fontSize: "1rem",
                      boxShadow: "0 4px 14px rgba(31, 58, 46, 0.25)",
                    }}
                  >
                    {item.step}
                  </div>
                  {index < 4 && (
                    <span style={{ fontSize: "1.35rem", color: "#C4883E", fontWeight: 700 }}>&rarr;</span>
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
                    color: "var(--color-muted)",
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

      {/* CTA Section */}
      <section className="container" style={{ paddingBlock: "5rem", maxWidth: "900px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #172D23 0%, #1F3A2E 100%)",
            color: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(2.5rem, 5vw, 4rem)",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
            border: "1.5px solid rgba(217, 164, 65, 0.35)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.85rem, 4vw, 2.5rem)",
              color: "#FFFFFF",
              marginBottom: "1rem",
            }}
          >
            <span style={{ color: "#FFFFFF" }}>Join Us in Restoring</span> <span style={{ color: "#D9A441" }}>Food Purity</span>
          </h2>
          <p
            style={{
              color: "rgba(251, 250, 246, 0.9)",
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              maxWidth: "580px",
              margin: "0 auto 2.25rem",
            }}
          >
            Experience the natural aroma, vibrant color, and verified lab purity of FarmSmith's GI-tagged produce.
          </p>
          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "#D9A441",
              color: "#1F3A2E",
              padding: "1rem 2.5rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 800,
              fontSize: "0.9375rem",
              textDecoration: "none",
              boxShadow: "0 8px 25px rgba(217, 164, 65, 0.35)",
            }}
          >
            Explore Our Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
