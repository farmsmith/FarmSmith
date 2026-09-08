import React from "react";
import { Star, CheckCircle2, Quote } from "lucide-react";

export default function CustomerReviewsSection() {
  return (
    <section style={{ background: "var(--color-background)", paddingBlock: "5rem 6rem" }}>
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto", paddingInline: "1rem" }}>
        
        <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 3rem" }}>
          <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem" }}>
            Real customers, Real words
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--color-primary)",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            What’s the buzz around <span style={{ color: "#C4883E" }}>Farmsmith</span> 🐝
          </h2>
        </div>

        {/* Single Featured Customer Review Card */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1.5px solid rgba(217, 164, 65, 0.35)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(2rem, 5vw, 3.5rem)",
            boxShadow: "0 16px 40px rgba(31, 58, 46, 0.08)",
            position: "relative",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", gap: "0.35rem", marginBottom: "1.5rem" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} style={{ color: "#D9A441", fill: "#D9A441" }} />
            ))}
          </div>

          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.1rem, 2.5vw, 1.45rem)",
              lineHeight: 1.7,
              color: "var(--color-primary)",
              fontStyle: "normal",
              margin: "0 auto 2rem",
              maxWidth: "700px",
              fontWeight: 500,
            }}
          >
            “My mother told it felt natural without any artificial element, she really liked it. Packaging is so good. really nice work, we need more honest brand like this. waiting for new products.”
          </p>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.2)", padding: "0.4rem 1rem", borderRadius: "100px" }}>
            <CheckCircle2 size={16} style={{ color: "#059669" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#065F46" }}>
              Verified Farmsmith Customer
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
