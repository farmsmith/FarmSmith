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
    product: "Turmeric Powder",
    dyes: "Absent",
    heavyMetals: "Absent",
    pesticides: "Absent",
    harvestDate: "Jan 2026",
  },
  {
    code: "FS00002",
    batchNo: "FS00002",
    product: "Organic Whole Turmeric Finger",
    dyes: "Absent",
    heavyMetals: "Absent",
    pesticides: "Absent",
    harvestDate: "Dec 2025",
  },
];

export default function PurityShowcase() {
  const [selectedBatchCode, setSelectedBatchCode] = useState("FS00001");
  const [inputCode, setInputCode] = useState("");
  const [activeBatch, setActiveBatch] = useState<SampleBatch | null>(SAMPLE_BATCHES[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputCode.trim();
    if (!query) {
      setErrorMessage("Please enter a valid batch number to view the report.");
      return;
    }

    const found = SAMPLE_BATCHES.find(
      (b) => b.code.toLowerCase() === query.toLowerCase() || b.batchNo.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      setActiveBatch(found);
      setSelectedBatchCode(found.code);
      setErrorMessage(null);
    } else {
      setErrorMessage("Invalid Batch Code. Please check the code printed on your packaging and try again.");
    }
  };

  return (
    <section id="standards" style={{ background: "var(--color-surface)", paddingBlock: "0 6rem", scrollMarginTop: "5rem" }}>
      <style>{`
        @media (max-width: 768px) {
          .batch-report-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
        }
        @media (max-width: 480px) {
          .batch-report-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      {/* 1. Full-width Dark Earthy Brown Section (Header + Know the Origin) */}
      <div
        style={{
          background: "linear-gradient(145deg, #2D1E12 0%, #1E140C 100%)",
          color: "#FAF6EE",
          paddingBlock: "5rem 4.5rem",
          marginBottom: "4rem",
          borderTop: "1px solid rgba(217, 164, 65, 0.25)",
          borderBottom: "1px solid rgba(217, 164, 65, 0.25)",
          boxShadow: "0 20px 40px rgba(30, 20, 12, 0.35)",
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 4rem", paddingInline: "1.5rem" }}>
          <p className="eyebrow" style={{ color: "#D9A441", marginBottom: "0.6rem", fontSize: "0.875rem", fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.12em" }}>
            OUR STANDARD: BATCH TRANSPARENCY
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.85rem, 4vw, 2.65rem)",
              fontWeight: 600,
              color: "#FAF6EE",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            YOU check the quality of YOUR product
          </h2>
          <p style={{ color: "#D4C7B5", fontSize: "1.0625rem", fontFamily: "var(--font-body)", fontWeight: 400, lineHeight: 1.75 }}>
            Commercial spices often rely on synthetic yellow dyes and unchecked sourcing. 
            Here is how FarmSmith redefines purity with batch-specific third-party testing.
          </p>
        </div>

        {/* Know the Origin Grid */}
        <div
          className="container"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            paddingInline: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.35rem)",
                fontWeight: 600,
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
      </div>

      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1rem" }}>

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
                Enter the batch code on your pack to verify the quality of your product. Protective packaging design preserves natural freshness with a shelf life of 1 year for our pure turmeric.
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
                Verify Quality
              </button>
            </form>

            {/* Error Message when Invalid / Not Found */}
            {errorMessage && (
              <div
                style={{
                  background: "#FFF5F5",
                  border: "1.5px solid #FEB2B2",
                  borderRadius: "0.75rem",
                  padding: "1rem 1.25rem",
                  color: "#9B2C2C",
                  fontSize: "0.9375rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  animation: "fadeIn 0.25s ease-in-out",
                }}
              >
                <AlertTriangle size={18} style={{ color: "#E53E3E", flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Batch Report Result Display */}
            {activeBatch && (
              <div
                className="batch-report-grid"
                style={{
                  background: "#FAF7EE",
                  border: "1.5px solid #E4D5B7",
                  borderRadius: "1rem",
                  padding: "1.75rem 2rem",
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                  gap: "1.5rem",
                  alignItems: "start",
                  boxShadow: "0 4px 16px rgba(196, 136, 62, 0.08)",
                  position: "relative",
                  animation: "fadeIn 0.3s ease-in-out",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                    PRODUCT & BATCH
                  </span>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)", margin: "0 0 0.25rem 0", whiteSpace: "nowrap" }}>
                    Farmsmith Turmeric Powder
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)", margin: 0, fontWeight: 600 }}>
                    Batch no : {activeBatch.batchNo}
                  </p>
                </div>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                    Artificial colour/dyes
                  </span>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "#065F46", margin: 0 }}>
                    {activeBatch.dyes}
                  </p>
                </div>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                    Heavy metals
                  </span>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "#065F46", margin: 0 }}>
                    {activeBatch.heavyMetals}
                  </p>
                </div>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "#8C7A6B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                    Pesticides
                  </span>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "#065F46", margin: 0 }}>
                    {activeBatch.pesticides}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
