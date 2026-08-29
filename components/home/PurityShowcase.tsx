"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, Check, Search, FileText, Sparkles, Award } from "lucide-react";

interface SampleBatch {
  code: string;
  product: string;
  curcumin: string;
  leadChromate: string;
  harvestDate: string;
  giLocation: string;
}

const SAMPLE_BATCHES: SampleBatch[] = [
  {
    code: "FS-2026-KAND",
    product: "Farmsmith Turmeric Powder",
    curcumin: "5.42% (High Potency)",
    leadChromate: "0.00% (Lab Cleared)",
    harvestDate: "Jan 2026",
    giLocation: "Kandhamal District, Odisha (GI Reg: 610)",
  },
  {
    code: "FS-2026-TURM",
    product: "Organic Whole Turmeric Finger",
    curcumin: "5.18% (High Potency)",
    leadChromate: "0.00% (Lab Cleared)",
    harvestDate: "Dec 2025",
    giLocation: "Kandhamal District, Odisha",
  },
];

export default function PurityShowcase() {
  const [selectedBatchCode, setSelectedBatchCode] = useState("FS-2026-KAND");
  const [inputCode, setInputCode] = useState("");
  const [activeBatch, setActiveBatch] = useState<SampleBatch>(SAMPLE_BATCHES[0]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = SAMPLE_BATCHES.find(
      (b) => b.code.toLowerCase() === inputCode.trim().toLowerCase()
    );
    if (found) {
      setActiveBatch(found);
      setSelectedBatchCode(found.code);
    } else {
      // Default demo result if any custom query is typed
      setActiveBatch({
        code: inputCode.toUpperCase() || "FS-BATCH-99",
        product: "FarmSmith Lab Verified Batch",
        curcumin: "5.35% (Verified)",
        leadChromate: "0.00% (Passed)",
        harvestDate: "Recent Harvest 2026",
        giLocation: "Odisha GI-Certified Soil",
      });
    }
    setSearched(true);
  };

  return (
    <section style={{ background: "var(--color-surface)", paddingBlock: "5rem 6rem" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1rem" }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
          <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem" }}>
            The FarmSmith Difference
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
            We don't ask for trust. <br className="hidden sm:inline" />
            <span style={{ color: "#C4883E" }}>We provide proof.</span>
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.7 }}>
            Commercial spices often rely on synthetic yellow dyes and unchecked sourcing. 
            Here is how FarmSmith redefines purity with batch-specific third-party testing.
          </p>
        </div>

        {/* 1. Comparison Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "4rem",
          }}
        >
          {/* Market Standard Box */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <AlertTriangle size={22} style={{ color: "#DC2626" }} />
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", color: "#1F2937", margin: 0 }}>
                Standard Market Spices
              </h3>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { title: "Unverified Origins", desc: "Blended from multiple unknown regions with no farm traceability." },
                { title: "Low / Variable Curcumin", desc: "Often diluted to under 1-2% curcumin levels." },
                { title: "Lead Chromate Risk", desc: "Chemical dyes used for artificial bright yellow luster." },
                { title: "No Batch Lab Reports", desc: "Claims 'pure' on packaging with zero accessible lab evidence." },
              ].map((item, idx) => (
                <li key={idx} style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem", color: "#4B5563" }}>
                  <span style={{ color: "#DC2626", fontWeight: 700 }}>✕</span>
                  <div>
                    <strong style={{ color: "#1F2937", display: "block" }}>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* FarmSmith Standard Box (Highlighted Gold/Green) */}
          <div
            style={{
              background: "var(--color-primary-dark)",
              color: "var(--color-card)",
              border: "2px solid #D9A441",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              boxShadow: "0 12px 32px rgba(31, 58, 46, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#D9A441",
                color: "#1F3A2E",
                fontSize: "0.6875rem",
                fontWeight: 800,
                padding: "0.25rem 0.75rem",
                borderRadius: "100px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Gold Standard
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <ShieldCheck size={24} style={{ color: "#D9A441" }} />
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", color: "#FFFFFF", margin: 0 }}>
                FarmSmith GI-Tagged Standard
              </h3>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { title: "100% GI-Tagged Origin", desc: "Traceable directly to Kandhamal, Odisha GI geographical index." },
                { title: "High Active Curcumin (5%+)", desc: "Naturally rich therapeutic potency batch-tested in certified labs." },
                { title: "Zero Lead & Zero Dyes", desc: "Lab-cleared for heavy metals, lead chromate, and synthetic colors." },
                { title: "Public Batch Reports", desc: "Scan or look up your batch code anytime for full lab transparency." },
              ].map((item, idx) => (
                <li key={idx} style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem", color: "rgba(251,250,246,0.9)" }}>
                  <Check size={18} style={{ color: "#D9A441", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ color: "#FFFFFF", display: "block" }}>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Interactive Batch Lab Report Lookup Simulator */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(1.5rem, 4vw, 2.5rem)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", color: "var(--color-primary)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={22} style={{ color: "#C4883E" }} />
                  Batch Lab Transparency Simulator
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: "0.25rem 0 0" }}>
                  Select or type a sample batch code to test our lab report verification system.
                </p>
              </div>

              {/* Sample Quick Select Pills */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {SAMPLE_BATCHES.map((b) => (
                  <button
                    key={b.code}
                    onClick={() => {
                      setSelectedBatchCode(b.code);
                      setActiveBatch(b);
                      setInputCode(b.code);
                      setSearched(true);
                    }}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "100px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      border: selectedBatchCode === b.code ? "1.5px solid #C4883E" : "1px solid #E5E7EB",
                      background: selectedBatchCode === b.code ? "rgba(196, 136, 62, 0.1)" : "#F9FAFB",
                      color: selectedBatchCode === b.code ? "#C4883E" : "#4B5563",
                      cursor: "pointer",
                    }}
                  >
                    {b.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Search Form */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Enter batch code (e.g. FS-2026-KAND)..."
                  style={{
                    width: "100%",
                    height: "2.75rem",
                    paddingLeft: "2.5rem",
                    paddingRight: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.875rem",
                    background: "var(--color-card)",
                  }}
                />
                <Search size={18} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
              </div>
              <button
                type="submit"
                style={{
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  padding: "0 1.5rem",
                  height: "2.75rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Verify Batch
              </button>
            </form>

            {/* Batch Report Result Display */}
            <div
              style={{
                background: "#FAF6EE",
                border: "1px dashed #D9A441",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.25rem",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Product & Batch
                </span>
                <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-primary)", margin: "0.25rem 0 0" }}>
                  {activeBatch.product}
                </p>
                <span style={{ fontSize: "0.75rem", color: "#C4883E", fontWeight: 600 }}>
                  Code: {activeBatch.code}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Curcumin Content
                </span>
                <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#059669", margin: "0.25rem 0 0", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Sparkles size={16} /> {activeBatch.curcumin}
                </p>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Heavy Metal / Lead Test
                </span>
                <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#059669", margin: "0.25rem 0 0", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <ShieldCheck size={16} /> {activeBatch.leadChromate}
                </p>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  GI Origin Location
                </span>
                <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-primary)", margin: "0.25rem 0 0", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Award size={16} style={{ color: "#C4883E" }} /> {activeBatch.giLocation}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
