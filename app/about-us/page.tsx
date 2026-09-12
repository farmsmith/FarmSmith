import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Wheat, Apple, Carrot, Salad, SaladIcon } from "lucide-react";

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
    desc: "Uncovering supply chain gaps, lack of batch testing, and unverified claims across everyday Indian kitchen staples.",
  },
  {
    step: "03",
    title: "The First Product",
    desc: "Launching FarmSmith Turmeric — GI-tagged, batch-tested, and transparent from origin to packing.",
  },
  {
    step: "04",
    title: "The Purpose",
    desc: "To help families make more informed choices about the food they bring home — by encouraging awareness about where food comes from, how it is grown, and what goes into it.",
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
        <div className="container" style={{ maxWidth: "860px", margin: "0 auto" }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "0.8125rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              color: "#D9A441",
              display: "block",
              marginBottom: "1.25rem",
            }}
          >
            OUR STORY AND PURPOSE
          </span>

          {/* Big Brand Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "#FFFFFF",
                overflow: "hidden",
                border: "3px solid #D9A441",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
              }}
            >
              <Image
                src="/images/farmsmith_logo_v2.png"
                alt="FarmSmith Logo"
                fill
                sizes="120px"
                unoptimized
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.6rem, 3.6vw, 2.35rem)",
              fontWeight: 600,
              lineHeight: 1.35,
              color: "#FFFFFF",
              maxWidth: "720px",
              margin: "0 auto",
            }}
          >
            &ldquo;Food doesn&apos;t begin on a supermarket shelf. It begins with soil, water, people and place.&rdquo;
          </h1>
        </div>
      </section>

      {/* Main Story Content */}
      <section className="container" style={{ paddingTop: "4.5rem", paddingBottom: "0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3.5rem",
            alignItems: "center",
            marginBottom: 0,
          }}
        >
          {/* Text Content */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 600,
                color: "var(--color-primary)",
                marginBottom: "1.25rem",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              WHY FARMSMITH EXISTS
            </h2>

            {/* Founder Quote Card */}
            <div
              style={{
                background: "rgba(217, 164, 65, 0.1)",
                borderLeft: "3px solid #D9A441",
                padding: "1rem 1.25rem",
                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  fontStyle: "italic",
                  color: "var(--color-primary)",
                  lineHeight: 1.5,
                  marginBottom: "0.5rem",
                }}
              >
                &ldquo;Every mother deserves access to safe and nourishing food she can trust for her child and family.&rdquo;
              </p>
              <p
                style={{
                  fontFamily: "var(--font-subheading)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#C4883E",
                  margin: 0,
                }}
              >
                — Subhashree Behera, Founder, FarmSmith
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.95rem",
                color: "var(--color-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "0.96875rem",
                fontWeight: 400,
                lineHeight: 1.75,
              }}
            >
              <p style={{ margin: 0 }}>
                A former Oil &amp; Gas sector executive, Subhashree chose to leave her corporate career to bring honest food to every household. She realised the importance of safe food for our well being after becoming a mother.
              </p>
              <p style={{ margin: 0 }}>
                FarmSmith was born from a desire to bring honest, thoughtfully sourced food to everyday households — food with a known origin, considered sourcing and greater transparency about its quality.
              </p>
              <p style={{ margin: 0 }}>
                We also want to reconnect with something we believe is worth preserving: the knowledge, crops and traditions of India&apos;s agricultural heritage.
              </p>
              <p style={{ margin: 0 }}>
                Our aim is not to romanticise the past or claim that everything traditional is automatically better. It is to learn from what was valuable, preserve what deserves to continue, and bring those ideas thoughtfully to today&apos;s everyday plate.
              </p>
              <p style={{ margin: 0, fontWeight: 500, color: "var(--color-primary)" }}>
                Because food is more than something we consume.
              </p>
              <p style={{ margin: 0 }}>
                What we eat influences our well-being, and how we grow our food shapes the environment around us.
              </p>
            </div>
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
      </section>

      {/* Botanical Green Heritage Band with Pure Artwork / Leaf & Crop Motifs (Full-Width to Screen - Sleek & Thin) */}
      <section
        style={{
          width: "100%",
          position: "relative",
          background: "linear-gradient(135deg, #162D21 0%, #1F3E2F 50%, #15291E 100%)",
          padding: "1rem 2rem",
          overflow: "hidden",
          borderTop: "1px solid rgba(217, 164, 65, 0.35)",
          borderBottom: "1px solid rgba(217, 164, 65, 0.35)",
          boxShadow: "0 10px 25px rgba(22, 45, 33, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBlock: "4.75rem",
        }}
      >
        {/* Subtle Ambient Dots Pattern */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage: `radial-gradient(#D9A441 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
            pointerEvents: "none",
          }}
        />

        {/* Symmetrical Ornamental Crop & Foliage Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(0.85rem, 2.5vw, 2rem)",
            width: "100%",
            maxWidth: "850px",
            zIndex: 1,
          }}
        >
          {/* Left Gradient Line */}
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(217, 164, 65, 0.6))",
            }}
          />

          {/* Botanical Motif 1: Sprout Leaf */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(217, 164, 65, 0.12)",
              border: "1px solid rgba(217, 164, 65, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D9A441",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>

          {/* Botanical Motif 2: Sun & Earth */}
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(217, 164, 65, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F4EFE4",
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </div>

          {/* Central Emblem: Golden Emblem */}
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(217, 164, 65, 0.25) 0%, rgba(217, 164, 65, 0.1) 100%)",
              border: "2px solid #D9A441",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D9A441",
              boxShadow: "0 0 16px rgba(217, 164, 65, 0.35)",
              flexShrink: 0,
            }}
          >
            <Apple size={22} strokeWidth={1.8} />
          </div>

          {/* Botanical Motif 4: Sprout */}
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(217, 164, 65, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F4EFE4",
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-13" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.4 2-4.6-2.7-.2-4.2.8-5.2 2z" />
            </svg>
          </div>

          {/* Botanical Motif 5: Leaf Pair */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(217, 164, 65, 0.12)",
              border: "1px solid rgba(217, 164, 65, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D9A441",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 20A7 7 0 0 0 14.2 6.1C8.5 5 7 4.48 5 2c-1 2-2 4.18-2 8 0 5.5 4.78 10 10 10Z" />
              <path d="M22 21c0-3-1.85-5.36-5.08-6C14.5 14.52 12 13 11 12" />
            </svg>
          </div>

          {/* Right Gradient Line */}
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "linear-gradient(90deg, rgba(217, 164, 65, 0.6), transparent)",
            }}
          />
        </div>
      </section>

      {/* ───── BRAND PHILOSOPHY: THE FARMSMITH JOURNEY (EARTHY BROWN BACKGROUND) ───── */}
      <section
        style={{
          background: "linear-gradient(145deg, #2D1E12 0%, #1E140C 100%)",
          color: "#FAF6EE",
          paddingBlock: "5.5rem",
          borderTop: "1px solid rgba(217, 164, 65, 0.25)",
          borderBottom: "1px solid rgba(217, 164, 65, 0.25)",
          boxShadow: "0 20px 40px rgba(30, 20, 12, 0.35)",
        }}
      >
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", paddingInline: "1rem" }}>

          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 4rem" }}>
            <p
              className="eyebrow"
              style={{
                fontFamily: "var(--font-body)",
                color: "#D9A441",
                marginBottom: "0.5rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              BRAND PHILOSOPHY
            </p>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 600,
                color: "#FFFFFF",
                lineHeight: 1.2,
                marginBottom: "0.875rem",
                letterSpacing: "-0.02em",
              }}
            >
              The FarmSmith Journey
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "#D9A441",
                fontSize: "1.0625rem",
                fontWeight: 500,
                lineHeight: 1.7,
              }}
            >
              From a mother&apos;s question to a movement for food transparency.
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
              fontWeight: 600,
              color: "#FFFFFF",
              marginBottom: "1rem",
              lineHeight: 1.2,
            }}
          >
            <span style={{ color: "#FFFFFF" }}>Join Us in Restoring</span>
            <br className="mobile-br" />{" "}
            <span style={{ color: "#D9A441" }}>Food Purity</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              color: "rgba(251, 250, 246, 0.9)",
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              maxWidth: "580px",
              margin: "0 auto 2.25rem",
            }}
          >
            Experience naturally grown Farmsmith products,<br className="hidden sm:inline" /> purity backed by batch test
          </p>
          <Link
            href="/#featured-harvest"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "#D9A441",
              color: "#1F3A2E",
              padding: "1rem 2.5rem",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-subheading)",
              fontWeight: 500,
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
