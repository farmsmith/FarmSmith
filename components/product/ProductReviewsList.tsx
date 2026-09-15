"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquarePlus, UserCheck } from "lucide-react";
import AddReviewModal from "./AddReviewModal";

interface Review {
  id: string;
  product_name: string;
  rating: number;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
}

interface ProductReviewsListProps {
  productName: string;
}

export default function ProductReviewsList({ productName }: ProductReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?product=${encodeURIComponent(productName)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productName]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <section style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid var(--color-border)" }}>
      {/* Header & Write Review Action */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <p
            className="eyebrow"
            style={{
              color: "#C4883E",
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}
          >
            Verified Feedback
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              color: "var(--color-primary)",
              margin: 0,
            }}
          >
            Customer Reviews ({reviews.length})
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {reviews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginRight: "0.5rem" }}>
              <div style={{ display: "flex", color: "#D9A441", gap: "2px" }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.round(Number(averageRating)) ? "#D9A441" : "none"}
                    stroke="#D9A441"
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "1.1rem" }}>
                {averageRating}
              </span>
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "linear-gradient(135deg, #162D21 0%, #1F3E2F 100%)",
              color: "#FAF6EE",
              border: "1px solid rgba(217, 164, 65, 0.4)",
              padding: "0.65rem 1.25rem",
              borderRadius: "100px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(22, 45, 33, 0.15)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <MessageSquarePlus size={16} color="#D9A441" />
            Write a Review
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: "center", paddingBlock: "2rem", color: "var(--color-muted)" }}>
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            background: "var(--color-card, #FFFFFF)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-lg, 12px)",
            padding: "3rem 1.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--color-muted)", fontSize: "1rem", margin: "0 0 1rem" }}>
            No reviews yet for this harvest. Be the first to share your experience!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "#F4EFE6",
              color: "var(--color-primary)",
              border: "1px solid rgba(217, 164, 65, 0.35)",
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Leave a Review
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: "var(--color-card, #FFFFFF)",
                border: "1px solid rgba(217, 164, 65, 0.2)",
                borderRadius: "var(--radius-lg, 14px)",
                padding: "1.5rem",
                boxShadow: "0 4px 16px rgba(31, 58, 46, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                {/* Rating Stars */}
                <div style={{ display: "flex", gap: "2px", marginBottom: "0.75rem", color: "#D9A441" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < rev.rating ? "#D9A441" : "none"}
                      stroke="#D9A441"
                    />
                  ))}
                </div>

                {/* Review Content */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.65,
                    color: "#2D3748",
                    fontStyle: "normal",
                    margin: "0 0 1.25rem",
                  }}
                >
                  &ldquo;{rev.content}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid #F3F4F6",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "var(--color-primary)" }}>
                    {rev.author_name}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#9CA3AF" }}>
                    {new Date(rev.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    background: "rgba(5, 150, 105, 0.08)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  <CheckCircle2 size={12} style={{ color: "#059669" }} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#065F46" }}>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      <AddReviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchReviews();
        }}
        productName={productName}
      />
    </section>
  );
}
