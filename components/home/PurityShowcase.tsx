"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, Check, Search, FileText, Sparkles, Award } from "lucide-react";

interface SampleBatch {
  code: string;
  batchNo: string;
  product: string;
  dyes: string;
  heavyMetals: string;
  pesticides: string;
  harvestDate: string;
}

const SAMPLE_BATCHES: SampleBatch[] = [
  {
    code: "FS00001",
    batchNo: "FS00001",
    product: "Farmsmith Turmeric Powder",
    dyes: "Absent (100% Pure)",
    heavyMetals: "Absent (Lab Cleared)",
    pesticides: "Absent (Organically Grown)",
    harvestDate: "Jan 2026",
  },
  {
    code: "FS00002",
    batchNo: "FS00002",
    product: "Organic Whole Turmeric Finger",
    dyes: "Absent (100% Pure)",
    heavyMetals: "Absent (Lab Cleared)",
    pesticides: "Absent (Organically Grown)",
    harvestDate: "Dec 2025",
  },
];

export default function PurityShowcase() {
  const [selectedBatchCode, setSelectedBatchCode] = useState("FS00001");
  const [inputCode, setInputCode] = useState("");
  const [activeBatch, setActiveBatch] = useState<SampleBatch>(SAMPLE_BATCHES[0]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = SAMPLE_BATCHES.find(
      (b) => b.code.toLowerCase() === inputCode.trim().toLowerCase() || b.batchNo.toLowerCase() === inputCode.trim().toLowerCase()
    );
    if (found) {
      setActiveBatch(found);
      setSelectedBatchCode(found.code);
    } else {
      // Default demo result if any custom query is typed
      const codeStr = inputCode.toUpperCase() || "FS00001";
      setActiveBatch({
        code: codeStr,
        batchNo: codeStr,
        product: "FarmSmith Lab Verified Batch",
        dyes: "Absent (100% Pure)",
        heavyMetals: "Absent (Passed)",
        pesticides: "Absent (Clean)",
        harvestDate: "Recent Harvest 2026",
      });
    }
    setSearched(true);
  };

  return (
    <section style={{ background: "var(--color-surface)", paddingBlock: "5rem 6rem" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1rem" }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
          <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.1em" }}>
            our standard: batch transparency
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
            You check the quality of our product
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.7 }}>
            Commercial spices often rely on synthetic yellow dyes and unchecked sourcing. 
            Here is how FarmSmith redefines purity with batch-specific third-party testing.
          </p>
        </div>

        {/* 1. Know the Origin Section (Dark Earthy Brown with Kandhamal Fields & Hills) */}
        <div
          style={{
            background: "linear-gradient(145deg, #2D1E12 0%, #1E140C 100%)",
            color: "#FAF6EE",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(2rem, 5vw, 3.5rem)",
            marginBottom: "4rem",
            boxShadow: "0 20px 40px rgba(30, 20, 12, 0.35)",
            border: "1px solid rgba(217, 164, 65, 0.25)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(217, 164, 65, 0.15)", padding: "0.35rem 0.85rem", borderRadius: "100px", marginBottom: "1.25rem", border: "1px solid rgba(217, 164, 65, 0.3)" }}>
              <Award size={16} style={{ color: "#D9A441" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D9A441" }}>
                GI Tagged Heritage (Reg: 610)
              </span>
            </div>
            
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.35rem)",
                color: "#FAF6EE",
                lineHeight: 1.2,
                marginBottom: "1.25rem",
                letterSpacing: "-0.01em",
              }}
            >
              Know the origin
            </h3>

            <p
              style={{
                color: "#E2D9CC",
                fontSize: "1.0625rem",
                lineHeight: 1.8,
                marginBottom: "1.5rem",
              }}
            >
              Nestled in the picturesque eastern ghats of Odisha, kandhamal treasures fertile and pristine environment that holds nature’s some of the most finest treasures. The GI tagged golden turmeric of kandhamal glows with purity. It is a heritage of health, nurtured by generations of farmers.
            </p>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
              <div style={{ borderLeft: "2px solid #D9A441", paddingLeft: "0.85rem" }}>
                <span style={{ display: "block", fontSize: "1.125rem", fontWeight: 700, color: "#D9A441" }}>Eastern Ghats</span>
                <span style={{ fontSize: "0.8125rem", color: "#B8ADA0" }}>Kandhamal, Odisha</span>
              </div>
              <div style={{ borderLeft: "2px solid #D9A441", paddingLeft: "0.85rem" }}>
                <span style={{ display: "block", fontSize: "1.125rem", fontWeight: 700, color: "#D9A441" }}>100% Organic</span>
                <span style={{ fontSize: "0.8125rem", color: "#B8ADA0" }}>Generational Soil</span>
              </div>
            </div>
          </div>

          {/* Kandhamal Landscape & Turmeric Harvest Image */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              aspectRatio: "16/10",
              boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
              border: "1px solid rgba(217, 164, 65, 0.2)",
            }}
          >
            <img
              src="/images/kandhamal_turmeric_hills.jpg"
              alt="Picturesque hills and golden turmeric fields of Kandhamal, Odisha"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* 2. Batch Quality Check Report Verification (Premium & Trustworthy) */}
        <div
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F4 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(2rem, 5vw, 3rem)",
            border: "1px solid rgba(217, 164, 65, 0.35)",
            boxShadow: "0 16px 40px rgba(31, 58, 46, 0.08), 0 2px 6px rgba(0,0,0,0.03)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle top accent ribbon */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #1F3A2E 0%, #D9A441 50%, #1F3A2E 100%)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            <div style={{ maxWidth: "700px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#C4883E", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                <ShieldCheck size={16} /> Verified Lab Certificate System
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.4rem, 3vw, 1.85rem)",
                  color: "var(--color-primary)",
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                Batch Quality check report
              </h3>
              <p style={{ fontSize: "0.9375rem", color: "#4B5563", margin: "0.4rem 0 0", lineHeight: 1.6 }}>
                Enter the batch code on your pack to verify the quality of your product
              </p>
            </div>

            {/* Input Search Form */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1 1 280px" }}>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Enter the batch code to see complete report"
                  style={{
                    width: "100%",
                    height: "3.25rem",
                    paddingLeft: "2.75rem",
                    paddingRight: "1rem",
                    borderRadius: "0.75rem",
                    border: "1.5px solid #D4CCBB",
                    fontSize: "0.9375rem",
                    color: "var(--color-primary)",
                    background: "#FFFFFF",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                    outline: "none",
                    fontWeight: 500,
                  }}
                />
                <Search size={20} style={{ position: "absolute", left: "0.95rem", top: "50%", transform: "translateY(-50%)", color: "#C4883E" }} />
              </div>
              <button
                type="submit"
                style={{
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  padding: "0 2rem",
                  height: "3.25rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 14px rgba(31, 58, 46, 0.25)",
                  transition: "background 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <ShieldCheck size={18} style={{ color: "#D9A441" }} />
                Verify Quality
              </button>
            </form>

            {/* Batch Report Result Display - Certificate Card Look */}
            <div
              style={{
                background: "#FAF7EE",
                border: "1.5px solid #E4D5B7",
                borderRadius: "1rem",
                padding: "1.5rem 1.75rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "1.5rem",
                boxShadow: "0 4px 16px rgba(196, 136, 62, 0.08)",
                position: "relative",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block" }}>
                  Product & Batch No.
                </span>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)", margin: "0.3rem 0 0.15rem" }}>
                  {activeBatch.product}
                </p>
                <span style={{ fontSize: "0.8125rem", color: "#9A6B27", fontWeight: 700, background: "rgba(217, 164, 65, 0.15)", padding: "0.2rem 0.6rem", borderRadius: "4px", display: "inline-block" }}>
                  Batch no: {activeBatch.batchNo}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block" }}>
                  Artificial colour/dyes
                </span>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#065F46", margin: "0.3rem 0 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShieldCheck size={18} style={{ color: "#059669" }} /> {activeBatch.dyes}
                </p>
                <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 500 }}>
                  ✓ Zero Synthetic Colorings
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block" }}>
                  Heavy metals
                </span>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#065F46", margin: "0.3rem 0 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShieldCheck size={18} style={{ color: "#059669" }} /> {activeBatch.heavyMetals}
                </p>
                <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 500 }}>
                  ✓ Lead, Mercury & Arsenic Free
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block" }}>
                  Pesticides
                </span>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#065F46", margin: "0.3rem 0 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShieldCheck size={18} style={{ color: "#059669" }} /> {activeBatch.pesticides}
                </p>
                <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 500 }}>
                  ✓ 100% Chemical & Pesticide Free
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
