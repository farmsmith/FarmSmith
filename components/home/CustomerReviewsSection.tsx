"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewItem {
  id?: string;
  rating: number;
  content: string;
  author_name: string;
  badge?: string;
}

const DEFAULT_FEATURED_REVIEW: ReviewItem = {
  id: "featured-1",
  rating: 5,
  content:
    "My mother told it felt natural without any artificial element, she really liked it. Packaging is so good. really nice work, we need more honest brand like this. waiting for new products.",
  author_name: "Verified Farmsmith Customer",
  badge: "Verified Farmsmith Customer",
};

export default function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([DEFAULT_FEATURED_REVIEW]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAssembled, setIsAssembled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAssembled(true);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadApprovedReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            const formatted = data.reviews.map((r: any) => ({
              id: r.id,
              rating: r.rating || 5,
              content: r.content,
              author_name: r.author_name,
              badge: "Verified Buyer",
            }));
            // Combine with default review
            setReviews([DEFAULT_FEATURED_REVIEW, ...formatted]);
          }
        }
      } catch (err) {
        console.warn("Notice loading approved reviews:", err);
      }
    }
    loadApprovedReviews();
  }, []);

  const currentReview = reviews[currentIndex] || DEFAULT_FEATURED_REVIEW;

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: "var(--color-background)",
        paddingBlock: "5rem 6rem",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto", paddingInline: "1rem" }}>
        <div
          style={{
            textAlign: "center",
            maxWidth: "650px",
            margin: "0 auto 3rem",
            opacity: isAssembled ? 1 : 0,
            transform: isAssembled ? "translateY(0)" : "translateY(30px)",
            transition: "all 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
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

        {/* Featured Customer Review Card */}
        <div
          style={{
            background: "var(--color-card, #FFFFFF)",
            border: "1.5px solid rgba(217, 164, 65, 0.35)",
            borderRadius: "var(--radius-xl, 18px)",
            padding: "clamp(2rem, 5vw, 3.5rem)",
            boxShadow: isAssembled
              ? "0 20px 48px rgba(31, 58, 46, 0.1)"
              : "0 4px 12px rgba(31, 58, 46, 0.03)",
            position: "relative",
            textAlign: "center",
            opacity: isAssembled ? 1 : 0,
            transform: isAssembled
              ? "translateY(0) scale(1)"
              : "translateY(40px) scale(0.94)",
            transition:
              "transform 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s, opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s, box-shadow 1.6s ease",
          }}
        >
          {/* Star Rating with Cascading Stagger */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginBottom: "1.5rem" }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  opacity: isAssembled ? 1 : 0,
                  transform: isAssembled ? "scale(1)" : "scale(0.4)",
                  transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.35 + i * 0.08}s`,
                }}
              >
                <Star
                  size={22}
                  style={{
                    color: "#D9A441",
                    fill: i < currentReview.rating ? "#D9A441" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Review Quote Text */}
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
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled ? "translateY(0)" : "translateY(15px)",
              transition: "all 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.35s",
            }}
          >
            &ldquo;{currentReview.content}&rdquo;
          </p>

          {/* Customer Name & Verified Badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled ? "translateY(0)" : "translateY(15px)",
              transition: "all 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.45s",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "var(--color-primary)" }}>
              {currentReview.author_name}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(5, 150, 105, 0.08)",
                border: "1px solid rgba(5, 150, 105, 0.2)",
                padding: "0.35rem 0.9rem",
                borderRadius: "100px",
              }}
            >
              <CheckCircle2 size={15} style={{ color: "#059669" }} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#065F46" }}>
                {currentReview.badge || "Verified Customer"}
              </span>
            </div>
          </div>

          {/* Controls if multiple reviews exist */}
          {reviews.length > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(217, 164, 65, 0.15)",
              }}
            >
              <button
                onClick={prevReview}
                aria-label="Previous review"
                style={{
                  background: "rgba(217, 164, 65, 0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ display: "flex", gap: "6px" }}>
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to review ${idx + 1}`}
                    style={{
                      width: currentIndex === idx ? "20px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      background: currentIndex === idx ? "#D9A441" : "rgba(217, 164, 65, 0.25)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={nextReview}
                aria-label="Next review"
                style={{
                  background: "rgba(217, 164, 65, 0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
