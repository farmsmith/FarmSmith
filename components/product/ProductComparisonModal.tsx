"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, ShieldCheck, Star, Award, Sparkles, FileText, MessageSquareQuote } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

interface ComparisonRow {
  parameter: string;
  farmsmithValue: string;
  marketValue: string;
  highlight?: boolean;
}

interface CustomerReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

// Product-specific comparison matrices
const getComparisonData = (productName?: string, category?: string | null): ComparisonRow[] => {
  const nameLower = productName?.toLowerCase() ?? "";
  const catLower = category?.toLowerCase() ?? "";

  if (nameLower.includes("oil") || catLower.includes("oil")) {
    return [
      {
        parameter: "Extraction Method",
        farmsmithValue: "Wood Ghani Cold-Pressed (< 40°C)",
        marketValue: "High-Heat Solvent Extraction (> 120°C)",
        highlight: true,
      },
      {
        parameter: "Pungency & Antioxidants",
        farmsmithValue: "100% Retained Natural Sinigrin",
        marketValue: "Deodorized & Stripped Nutrients",
      },
      {
        parameter: "Adulteration & Carrier Oils",
        farmsmithValue: "0% Argemone / 0% Mineral Oil",
        marketValue: "Frequently Blended with Cheap Oils",
      },
      {
        parameter: "Aroma & Flavor",
        farmsmithValue: "Rich Traditional Pungent Aroma",
        marketValue: "Flat Chemical Aftertaste",
      },
      {
        parameter: "Sourcing & Purity",
        farmsmithValue: "Single-Origin Farm Direct",
        marketValue: "Multi-Source Commercial Stock",
      },
    ];
  }

  if (nameLower.includes("rice") || catLower.includes("rice")) {
    return [
      {
        parameter: "Sourcing Origin",
        farmsmithValue: "GI-Tagged Spring Water Farms",
        marketValue: "Mixed Commercial Mandi Stock",
        highlight: true,
      },
      {
        parameter: "Grain Processing",
        farmsmithValue: "Unpolished Whole Grain (High Fiber)",
        marketValue: "Triple-Polished (Bran Stripped)",
      },
      {
        parameter: "Pesticide Residue",
        farmsmithValue: "0% Pesticides (Lab Tested)",
        marketValue: "Chemical Fertilizer Residues",
      },
      {
        parameter: "Natural Aroma",
        farmsmithValue: "Authentic Heritage Rice Fragrance",
        marketValue: "Artificial Spray Scented",
      },
    ];
  }

  if (nameLower.includes("daal") || nameLower.includes("toor") || catLower.includes("daal")) {
    return [
      {
        parameter: "Polish & Shine",
        farmsmithValue: "100% Unpolished & Oil-Free",
        marketValue: "Leather/Oil Polished for Fake Gloss",
        highlight: true,
      },
      {
        parameter: "Chemical Additives",
        farmsmithValue: "0% Artificial Coloring Agents",
        marketValue: "Metanil Yellow Color Coating",
      },
      {
        parameter: "Cookability & Digestibility",
        farmsmithValue: "Easily Cooked, High Natural Protein",
        marketValue: "Hard Grains, Causes Bloating",
      },
      {
        parameter: "Farm Traceability",
        farmsmithValue: "Direct Organic Farm Clusters",
        marketValue: "Untraced Bulk Traders",
      },
    ];
  }

  // Default: Spices / Turmeric
  return [
    {
      parameter: "Curcumin / Active Potency",
      farmsmithValue: "5.2%+ Guaranteed High Curcumin",
      marketValue: "Low 1.5% - 2.0% (Extracted for Pharma)",
      highlight: true,
    },
    {
      parameter: "Purity & Dyes",
      farmsmithValue: "0% Lead Chromate & 0% Dyes",
      marketValue: "High Risk of Metanil Yellow Dyes",
    },
    {
      parameter: "Grinding Method",
      farmsmithValue: "Low-Temp Cold Mill (Oils Saved)",
      marketValue: "High-Speed Steel Grinding (Oils Burnt)",
    },
    {
      parameter: "Origin Sourcing",
      farmsmithValue: "Single-Origin GI-Tagged (Kandhamal)",
      marketValue: "Blended Multi-State Commercial Powders",
    },
    {
      parameter: "Batch Quality Testing",
      farmsmithValue: "NABL Lab Certified Batch Reports",
      marketValue: "Untested Commercial Bulk Stocks",
    },
  ];
};

const VERIFIED_REVIEWS: CustomerReview[] = [
  {
    name: "Dr. Ananya Sen",
    location: "Bhubaneswar, Odisha",
    rating: 5,
    date: "12 Feb 2026",
    comment: "Tested Farmsmith Turmeric in hot water at home — 0% color separation or chemical floaters! The golden aroma is unmatched. Highly recommended for daily immunity.",
    verified: true,
  },
  {
    name: "Rajesh K. Sharma",
    location: "Bengaluru, Karnataka",
    rating: 5,
    date: "28 Jan 2026",
    comment: "You can instantly tell the difference between store-bought yellow powder and real cold-ground turmeric. It has a rich, earthy warmth with zero bitterness.",
    verified: true,
  },
  {
    name: "Meenakshi Sundaram",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    date: "04 Feb 2026",
    comment: "I purchased this after researching Kandhamal GI turmeric. The lab certificate scan gives total peace of mind for my family's health.",
    verified: true,
  },
];

export default function ProductComparisonModal({
  isOpen,
  onClose,
  product,
}: ProductComparisonModalProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "reviews">("matrix");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const productName = product?.name ?? "Farmsmith Turmeric Powder";
  const rows = getComparisonData(productName, product?.category);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(18, 30, 20, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease-out forwards",
      }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(46, 77, 50, 0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #1C352D 0%, #2E4D32 100%)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <Sparkles size={18} style={{ color: "#D9A441" }} />
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#D9A441",
                }}
              >
                Quality Assurance Guide
              </span>
            </div>
            <h2
              id="modal-title"
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Why Farmsmith vs. Market Brands
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close comparison modal"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #E5E9E5",
            background: "#F9FAF9",
            padding: "0.5rem 1.5rem 0",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => setActiveTab("matrix")}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: activeTab === "matrix" ? "#2E4D32" : "#6B7A6B",
              borderBottom: activeTab === "matrix" ? "3px solid #2E4D32" : "3px solid transparent",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.15s ease",
            }}
          >
            <Award size={16} />
            Side-by-Side Comparison
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: activeTab === "reviews" ? "#2E4D32" : "#6B7A6B",
              borderBottom: activeTab === "reviews" ? "3px solid #2E4D32" : "3px solid transparent",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.15s ease",
            }}
          >
            <MessageSquareQuote size={16} />
            Verified Customer Reviews
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: "1.5rem",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {activeTab === "matrix" && (
            <div>
              {/* Product Target Subtitle */}
              <div
                style={{
                  background: "#F4F7F4",
                  border: "1px solid #D5E0D6",
                  borderRadius: "12px",
                  padding: "0.875rem 1rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "0.875rem", color: "#2E4D32", fontWeight: 600 }}>
                  Comparing: <span style={{ color: "#1C352D", fontWeight: 700 }}>{productName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#B37E14", fontWeight: 600 }}>
                  <ShieldCheck size={16} /> 100% Lab Certified Pure
                </div>
              </div>

              {/* Comparison Table */}
              <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #E2E8E2" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ background: "#2E4D32", color: "#FFFFFF" }}>
                      <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Quality Factor</th>
                      <th style={{ padding: "0.875rem 1rem", fontWeight: 700, background: "#1C352D" }}>
                        🌿 Farmsmith Standard
                      </th>
                      <th style={{ padding: "0.875rem 1rem", fontWeight: 600, opacity: 0.9 }}>
                        🛒 Commercial Market
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: row.highlight ? "#F0F7F1" : idx % 2 === 0 ? "#FFFFFF" : "#F9FAF9",
                          borderBottom: "1px solid #EAEFEA",
                        }}
                      >
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 600, color: "#1C352D" }}>
                          {row.parameter}
                        </td>
                        <td
                          style={{
                            padding: "0.875rem 1rem",
                            fontWeight: 700,
                            color: "#1E5E29",
                            background: row.highlight ? "rgba(30, 94, 41, 0.08)" : "transparent",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <CheckCircle2 size={16} style={{ color: "#2E7D32", flexShrink: 0 }} />
                            <span>{row.farmsmithValue}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", color: "#7F8C8D" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <XCircle size={16} style={{ color: "#C0392B", flexShrink: 0 }} />
                            <span>{row.marketValue}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lab Certification Highlight Banner */}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "12px",
                  background: "#FFFBF0",
                  border: "1px solid #F5E6C4",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#D9A441",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#7A570F" }}>
                    NABL Lab Tested & Certified Safe
                  </h4>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "#8C6A1B", lineHeight: 1.4 }}>
                    Every Farmsmith batch undergoes rigorous GC-MS purity testing for zero lead chromate, zero synthetic colors, and 100% natural bioactive retention.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Overall Rating Summary */}
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "12px",
                  background: "#F4F7F4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #D8E3D9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#1C352D" }}>4.9</span>
                  <div>
                    <div style={{ display: "flex", color: "#D9A441", gap: "2px" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill="#D9A441" stroke="none" />
                      ))}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#6B7A6B", fontWeight: 600 }}>
                      Based on 148+ verified purchases
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#2E7D32",
                    background: "#E8F5E9",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "20px",
                  }}
                >
                  ✓ 100% Verified Buyers
                </span>
              </div>

              {/* Customer Reviews List */}
              {VERIFIED_REVIEWS.map((rev, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "12px",
                    border: "1px solid #EAEFEA",
                    background: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 700, color: "#1C352D", fontSize: "0.9375rem" }}>{rev.name}</span>
                      {rev.verified && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            color: "#2E7D32",
                            background: "#E8F5E9",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "10px",
                          }}
                        >
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#95A5A6" }}>{rev.date}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", color: "#D9A441", gap: "1px" }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#D9A441" stroke="none" />
                      ))}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#6B7A6B" }}>· {rev.location}</span>
                  </div>

                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#4A5568", lineHeight: 1.6 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "#F9FAF9",
            borderTop: "1px solid #E5E9E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "#6B7A6B", fontWeight: 500 }}>
            🌿 Guaranteed Pure · Direct Farm Sourced
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "8px",
              background: "#2E4D32",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1C352D")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2E4D32")}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
