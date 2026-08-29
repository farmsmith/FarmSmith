"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";

export default function GoldenMilkSection() {
  const [servings, setServings] = useState<number>(2);

  return (
    <section style={{ background: "var(--color-surface)", paddingBlock: "5rem" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1rem" }}>
        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3.5rem",
            alignItems: "center",
          }}
          className="lg:grid-cols-2"
        >
          {/* Left Column: Image with Floating Recipe Card */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                aspectRatio: "4/3",
                maxWidth: "520px",
                width: "100%",
                margin: "0 auto",
                boxShadow: "var(--shadow-raised)",
              }}
            >
              <Image
                src="/images/recipe_golden_milk.png"
                alt="A glass of golden milk made with FarmSmith turmeric — rich golden colour"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Floating Science Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "-1.25rem",
                right: "1rem",
                background: "var(--color-primary-dark)",
                color: "#FFFFFF",
                padding: "0.875rem 1.25rem",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
                border: "1.5px solid #D9A441",
                maxWidth: "260px",
              }}
            >
              <p style={{ fontSize: "0.75rem", color: "#D9A441", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Bioavailability Science
              </p>
              <p style={{ fontSize: "0.8125rem", margin: "0.25rem 0 0", lineHeight: 1.4, color: "rgba(251,250,246,0.9)" }}>
                Curcumin requires healthy fats (ghee/milk) & piperine (pepper) to absorb 2000% better.
              </p>
            </div>
          </div>

          {/* Right Column: Recipe Interactive Guide */}
          <div>
            <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem" }}>
              In Your Kitchen
            </p>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.35rem)",
                color: "var(--color-primary)",
                marginBottom: "1rem",
                lineHeight: 1.25,
              }}
            >
              Golden Milk — <span style={{ color: "#C4883E" }}>The Authentic Way</span>
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Commercial golden milk powders often contain fillers and instant sweeteners. 
              Our Kandhamal turmeric turns milk a saturated golden hue because of its rich natural curcumin concentration.
            </p>

            {/* Interactive Serving Adjuster */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem 1.5rem",
                border: "1px solid var(--color-border)",
                marginBottom: "1.5rem",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary)" }}>
                  Authentic Recipe Proportions:
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>Servings:</span>
                  {[1, 2, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setServings(num)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: servings === num ? "1.5px solid #C4883E" : "1px solid #E5E7EB",
                        background: servings === num ? "rgba(196, 136, 62, 0.15)" : "#FFFFFF",
                        color: servings === num ? "#C4883E" : "#4B5563",
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Ingredient Quantities */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  <CheckCircle size={16} style={{ color: "#059669" }} />
                  <span><strong>{0.5 * servings} tsp</strong> FarmSmith Kandhamal Turmeric</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  <CheckCircle size={16} style={{ color: "#059669" }} />
                  <span><strong>{1 * servings} cup</strong> Whole Milk / A2 Cow Milk</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  <CheckCircle size={16} style={{ color: "#059669" }} />
                  <span><strong>{0.25 * servings} tsp</strong> Pure Desi Ghee</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  <CheckCircle size={16} style={{ color: "#059669" }} />
                  <span>Pinch of freshly ground Black Pepper</span>
                </div>
              </div>
            </div>

            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--color-primary)",
                color: "#FFFFFF",
                padding: "0.875rem 1.75rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(31, 58, 46, 0.15)",
              }}
            >
              Get Pure Turmeric For Your Kitchen <ArrowRight size={18} />
            </Link>

          </div>
        </div>

      </div>
    </section>
  );
}
