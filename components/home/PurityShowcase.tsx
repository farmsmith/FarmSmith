"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, AlertTriangle, Check, CheckCircle2, Search, FileText, Sparkles, Award, ChevronLeft, ChevronRight } from "lucide-react";

const ORIGIN_SLIDES = [
  { src: "/images/Know the origin 0.PNG", alt: "Know the origin - Kandhamal Turmeric Heritage 0" },
  { src: "/images/Know the origin 1.PNG", alt: "Know the origin - Kandhamal Turmeric Heritage 1" },
  { src: "/images/Know the origin 2.PNG", alt: "Know the origin - Kandhamal Turmeric Heritage 2" },
  { src: "/images/Know the Origin 3.jpg", alt: "Know the origin - Kandhamal Turmeric Heritage 3" },
];

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
  const [isAssembled, setIsAssembled] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [verifyPulseKey, setVerifyPulseKey] = useState(0);

  // Know the origin slideshow state
  const [originSlideIdx, setOriginSlideIdx] = useState(0);

  const originRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Auto-slide origin images every 4.0 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setOriginSlideIdx((prev) => (prev + 1) % ORIGIN_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevOriginSlide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setOriginSlideIdx((prev) => (prev - 1 + ORIGIN_SLIDES.length) % ORIGIN_SLIDES.length);
  };

  const nextOriginSlide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setOriginSlideIdx((prev) => (prev + 1) % ORIGIN_SLIDES.length);
  };

  useEffect(() => {
    const el = originRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAssembled(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = reportRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsReportVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      setVerifyPulseKey((prev) => prev + 1);
      setIsReportVisible(true);
    } else {
      setErrorMessage("Invalid Batch Code. Please check the code printed on your packaging and try again.");
    }
  };

  return (
    <section
      id="standards"
      style={{ background: "var(--color-surface)", paddingBlock: "0 6rem", scrollMarginTop: "5rem", overflow: "hidden" }}
    >
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
        @keyframes labTileStampIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.88);
          }
          65% {
            opacity: 1;
            transform: translateY(-4px) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes greenCheckStamp {
          0% {
            transform: scale(0.2) rotate(-25deg);
          }
          70% {
            transform: scale(1.18) rotate(0deg);
            box-shadow: 0 0 16px rgba(5, 150, 105, 0.45);
          }
          100% {
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 0 rgba(5, 150, 105, 0);
          }
        }
      `}</style>
      
      {/* 1. Full-width Dark Earthy Brown Section (Header + Know the Origin) */}
      <div
        ref={originRef}
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
        <div
          style={{
            textAlign: "center",
            maxWidth: "720px",
            margin: "0 auto 4rem",
            paddingInline: "1.5rem",
            opacity: isAssembled ? 1 : 0,
            transform: isAssembled ? "translateY(0)" : "translateY(30px)",
            transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
          }}
        >
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
            Here is how FarmSmith redefines purity with batch-specific third-party testing.
          </p>
        </div>

        {/* Know the Origin Grid: Converging Assemble (Text from Left, Image from Right) */}
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
          {/* Left Text Block - Slides in slowly from Left to Right */}
          <div
            style={{
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled ? "translateX(0)" : "translateX(-85px)",
              transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
            }}
          >
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
                <span style={{ display: "block", fontSize: "1.125rem", fontWeight: 700, color: "#D9A441" }}>Traditionally cultivated on</span>
                <span style={{ fontSize: "0.8125rem", color: "#B8ADA0" }}>Generational Soil</span>
              </div>
            </div>
          </div>

          {/* Right Landscape Image Slideshow - Know the origin 0 to 3 with Arrow Controls */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg, 16px)",
              overflow: "hidden",
              aspectRatio: "16/10",
              boxShadow: isAssembled ? "0 16px 36px rgba(0,0,0,0.45)" : "0 4px 12px rgba(0,0,0,0.2)",
              border: "1.5px solid rgba(217, 164, 65, 0.35)",
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled ? "translateX(0) scale(1)" : "translateX(85px) scale(0.92)",
              transition: "transform 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, box-shadow 2.75s ease",
            }}
          >
            {/* Sliding Track */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                transform: `translateX(-${originSlideIdx * 100}%)`,
                transition: "transform 0.75s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {ORIGIN_SLIDES.map((slide, idx) => (
                <div
                  key={slide.src}
                  style={{
                    flex: "0 0 100%",
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: idx === 0 ? "top center" : "center",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Counter Badge (Top-right) */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 10,
                background: "rgba(23, 45, 35, 0.8)",
                backdropFilter: "blur(6px)",
                color: "#FBFAF6",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "100px",
                border: "1px solid rgba(217, 164, 65, 0.4)",
                letterSpacing: "0.05em",
                userSelect: "none",
              }}
            >
              <span style={{ color: "#D9A441" }}>{originSlideIdx + 1}</span> / {ORIGIN_SLIDES.length}
            </div>

            {/* Left Arrow Button */}
            <button
              onClick={prevOriginSlide}
              aria-label="Previous origin image"
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(23, 45, 35, 0.75)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(217, 164, 65, 0.4)",
                color: "#FBFAF6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#D9A441";
                e.currentTarget.style.color = "#1F3A2E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(23, 45, 35, 0.75)";
                e.currentTarget.style.color = "#FBFAF6";
              }}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>

            {/* Right Arrow Button */}
            <button
              onClick={nextOriginSlide}
              aria-label="Next origin image"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(23, 45, 35, 0.75)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(217, 164, 65, 0.4)",
                color: "#FBFAF6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#D9A441";
                e.currentTarget.style.color = "#1F3A2E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(23, 45, 35, 0.75)";
                e.currentTarget.style.color = "#FBFAF6";
              }}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1rem" }}>

        {/* 2. Batch Quality Check Report Verification (Premium & Trustworthy) */}
        <div
          ref={reportRef}
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F4 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(2rem, 5vw, 3rem)",
            border: isReportVisible ? "1.5px solid rgba(217, 164, 65, 0.5)" : "1px solid rgba(217, 164, 65, 0.25)",
            boxShadow: isReportVisible
              ? "0 24px 54px rgba(31, 58, 46, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
              : "0 4px 12px rgba(31, 58, 46, 0.02)",
            position: "relative",
            overflow: "hidden",
            opacity: isReportVisible ? 1 : 0,
            transform: isReportVisible ? "translateY(0) scale(1)" : "translateY(45px) scale(0.96)",
            transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1)",
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
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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
                  transition: "background 0.2s ease, transform 0.15s ease",
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

            {/* Batch Report Result Display (Premium & Attractive Lab-Verification Styling) */}
            {activeBatch && (
              <div
                key={`${activeBatch.code}-${verifyPulseKey}`}
                className="batch-report-grid"
                style={{
                  background: "linear-gradient(145deg, #FFFFFF 0%, #FAF8F2 100%)",
                  border: "1.5px solid rgba(217, 164, 65, 0.45)",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
                  gap: "1rem",
                  alignItems: "stretch",
                  boxShadow: "0 12px 32px rgba(31, 58, 46, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                  position: "relative",
                }}
              >
                {/* Tile 1: Product & Batch */}
                <div
                  style={{
                    background: "rgba(31, 58, 46, 0.04)",
                    border: "1px solid rgba(31, 58, 46, 0.1)",
                    borderRadius: "0.875rem",
                    padding: "1.25rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: "0.35rem",
                    animation: isReportVisible ? "labTileStampIn 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both" : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#A06B28",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    PRODUCT & BATCH
                  </span>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "var(--color-primary)",
                      margin: 0,
                      fontFamily: "var(--font-heading)",
                      lineHeight: 1.3,
                    }}
                  >
                    Farmsmith Turmeric Powder
                  </p>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#4B5563",
                      background: "rgba(217, 164, 65, 0.15)",
                      border: "1px solid rgba(217, 164, 65, 0.3)",
                      padding: "0.15rem 0.65rem",
                      borderRadius: "100px",
                      fontWeight: 600,
                      fontFamily: "monospace",
                      marginTop: "0.2rem",
                    }}
                  >
                    Batch no : {activeBatch.batchNo}
                  </span>
                </div>

                {/* Tile 2: Artificial colour/dyes */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(217, 164, 65, 0.25)",
                    borderRadius: "0.875rem",
                    padding: "1.25rem 0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: "0.6rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    animation: isReportVisible ? "labTileStampIn 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.28s both" : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    Artificial colour/dyes
                  </span>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "rgba(5, 150, 105, 0.08)",
                      border: "1px solid rgba(5, 150, 105, 0.25)",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "100px",
                      animation: isReportVisible ? "greenCheckStamp 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both" : "none",
                    }}
                  >
                    <CheckCircle2 size={15} style={{ color: "#059669", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#065F46" }}>
                      {activeBatch.dyes}
                    </span>
                  </div>
                </div>

                {/* Tile 3: Heavy metals */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(217, 164, 65, 0.25)",
                    borderRadius: "0.875rem",
                    padding: "1.25rem 0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: "0.6rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    animation: isReportVisible ? "labTileStampIn 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.44s both" : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    Heavy metals
                  </span>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "rgba(5, 150, 105, 0.08)",
                      border: "1px solid rgba(5, 150, 105, 0.25)",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "100px",
                      animation: isReportVisible ? "greenCheckStamp 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.56s both" : "none",
                    }}
                  >
                    <CheckCircle2 size={15} style={{ color: "#059669", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#065F46" }}>
                      {activeBatch.heavyMetals}
                    </span>
                  </div>
                </div>

                {/* Tile 4: Pesticides */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(217, 164, 65, 0.25)",
                    borderRadius: "0.875rem",
                    padding: "1.25rem 0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: "0.6rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    animation: isReportVisible ? "labTileStampIn 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s both" : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    Pesticides
                  </span>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "rgba(5, 150, 105, 0.08)",
                      border: "1px solid rgba(5, 150, 105, 0.25)",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "100px",
                      animation: isReportVisible ? "greenCheckStamp 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.72s both" : "none",
                    }}
                  >
                    <CheckCircle2 size={15} style={{ color: "#059669", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#065F46" }}>
                      {activeBatch.pesticides}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
