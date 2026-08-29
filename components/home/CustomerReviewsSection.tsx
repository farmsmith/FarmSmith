"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  city: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
}

const REVIEWS: Testimonial[] = [
  {
    name: "Sunita Sharma",
    role: "Mother of 2 & Home Chef",
    city: "Bhubaneswar, Odisha",
    rating: 5,
    comment:
      "I was looking for turmeric powder that I could trust for my children's daily golden milk. FarmSmith's lab report printed right on the batch details gave me 100% confidence. The aroma and deep golden color are unmatched!",
    verifiedPurchase: true,
  },
  {
    name: "Dr. Ananya Roy",
    role: "Clinical Nutritionist",
    city: "Kolkata, WB",
    rating: 5,
    comment:
      "High-curcumin turmeric is essential for therapeutic anti-inflammatory benefits. FarmSmith's 5.4% curcumin lab certification makes it one of the cleanest organic spices available in India today.",
    verifiedPurchase: true,
  },
  {
    name: "Rajesh K. Patnaik",
    role: "Culinary Enthusiast",
    city: "Bengaluru, KA",
    rating: 5,
    comment:
      "Knowing that this turmeric is GI-tagged from Kandhamal and lab-checked for heavy metals gives total peace of mind. Exceptional quality and super fast shipping!",
    verifiedPurchase: true,
  },
];

export default function CustomerReviewsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide on mobile every 4 seconds
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % REVIEWS.length);
  };

  return (
    <section style={{ background: "var(--color-background)", paddingBlock: "5rem 6rem" }}>
      <style>{`
        .reviews-desktop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .reviews-mobile-carousel {
          display: none;
        }
        @media (max-width: 767px) {
          .reviews-desktop-grid {
            display: none !important;
          }
          .reviews-mobile-carousel {
            display: block !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1rem" }}>
        
        <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 3.5rem" }}>
          <p className="eyebrow" style={{ color: "#C4883E", marginBottom: "0.5rem" }}>
            Real Feedback
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
            Loved by mothers, trusted by <span style={{ color: "#C4883E" }}>nutritionists</span>
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.7 }}>
            See why families across India choose FarmSmith for uncompromised food purity and complete batch transparency.
          </p>
        </div>

        {/* Desktop Reviews Grid */}
        <div className="reviews-desktop-grid">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.25rem",
                position: "relative",
              }}
            >
              <Quote
                size={36}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  color: "rgba(196, 136, 62, 0.15)",
                }}
              />

              <div>
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} style={{ color: "#D9A441", fill: "#D9A441" }} />
                  ))}
                </div>

                <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "#374151", margin: 0, fontStyle: "italic" }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                <div>
                  <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", color: "var(--color-primary)", margin: 0, fontWeight: 700 }}>
                    {rev.name}
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0.15rem 0 0" }}>
                    {rev.role} &bull; {rev.city}
                  </p>
                </div>

                {rev.verifiedPurchase && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: "#059669",
                      background: "#ECFDF5",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "100px",
                      marginLeft: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <CheckCircle2 size={12} /> Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Single Card Carousel */}
        <div
          className="reviews-mobile-carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div style={{ overflow: "hidden", position: "relative", padding: "0.25rem 0" }}>
            <div
              style={{
                display: "flex",
                transform: `translateX(-${activeIdx * 100}%)`,
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {REVIEWS.map((rev, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "100%",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "1.75rem 1.5rem",
                      boxShadow: "var(--shadow-card)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "1.25rem",
                      position: "relative",
                      minHeight: "260px",
                    }}
                  >
                    <Quote
                      size={32}
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        color: "rgba(196, 136, 62, 0.15)",
                      }}
                    />

                    <div>
                      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.875rem" }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={15} style={{ color: "#D9A441", fill: "#D9A441" }} />
                        ))}
                      </div>

                      <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "#374151", margin: 0, fontStyle: "italic" }}>
                        "{rev.comment}"
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: "0.875rem" }}>
                      <div>
                        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", color: "var(--color-primary)", margin: 0, fontWeight: 700 }}>
                          {rev.name}
                        </h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0.15rem 0 0" }}>
                          {rev.role} &bull; {rev.city}
                        </p>
                      </div>

                      {rev.verifiedPurchase && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            color: "#059669",
                            background: "#ECFDF5",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "100px",
                            marginLeft: "auto",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <CheckCircle2 size={11} /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls for Mobile */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "1.25rem" }}>
            <button
              onClick={handlePrev}
              aria-label="Previous review"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
              }}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Pagination Dots */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Go to review ${i + 1}`}
                  style={{
                    width: activeIdx === i ? "22px" : "8px",
                    height: "8px",
                    borderRadius: "100px",
                    background: activeIdx === i ? "#C4883E" : "var(--color-border)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next review"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
