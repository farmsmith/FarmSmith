"use client";

import { useState, useEffect } from "react";
import { Star, X, CheckCircle2, MessageSquarePlus } from "lucide-react";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function AddReviewModal({
  isOpen,
  onClose,
  productName,
}: AddReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!review.trim()) {
      setError("Please write your review feedback");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Submit to API backend route
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          rating,
          name: name.trim(),
          email: email.trim() || undefined,
          review: review.trim(),
        }),
      });

      // 2. Cache in local storage for instant offline / client confirmation
      try {
        const existingReviews = JSON.parse(
          localStorage.getItem("farmsmith_user_reviews") || "[]"
        );
        existingReviews.push({
          productName,
          rating,
          name: name.trim(),
          email: email.trim(),
          review: review.trim(),
          date: new Date().toISOString(),
        });
        localStorage.setItem(
          "farmsmith_user_reviews",
          JSON.stringify(existingReviews)
        );
      } catch (storageErr) {
        console.warn("Local storage cache notice:", storageErr);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error && res.status !== 500) {
          setError(data.error);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit review:", err);
      // Fallback gracefully so user experience remains positive
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setName("");
    setEmail("");
    setReview("");
    setRating(5);
    setError(null);
    onClose();
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return "Excellent — Pure & Genuine";
      case 4:
        return "Very Good — Great Quality";
      case 3:
        return "Good — Met Expectations";
      case 2:
        return "Fair — Room for Improvement";
      case 1:
        return "Poor — Not Satisfied";
      default:
        return "";
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-review-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(18, 30, 24, 0.65)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          background: "#FFFFFF",
          borderRadius: "var(--radius-xl, 18px)",
          border: "1px solid rgba(217, 164, 65, 0.25)",
          boxShadow: "0 24px 48px rgba(22, 45, 33, 0.22)",
          overflow: "hidden",
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #162D21 0%, #1F3E2F 100%)",
            color: "#FFFFFF",
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(217, 164, 65, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(217, 164, 65, 0.2)",
                border: "1px solid #D9A441",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D9A441",
              }}
            >
              <MessageSquarePlus size={18} />
            </div>
            <div>
              <h3
                id="add-review-title"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  margin: 0,
                  color: "#FFFFFF",
                }}
              >
                Add Your Review
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#D9A441",
                  margin: 0,
                  fontFamily: "var(--font-body)",
                }}
              >
                {productName}
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            aria-label="Close dialog"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
            }
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.5rem" }}>
          {isSubmitted ? (
            <div
              style={{
                textAlign: "center",
                paddingBlock: "2rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(5, 150, 105, 0.1)",
                  border: "2px solid #059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669",
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Thank You for Your Review!
                </h4>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.6,
                    maxWidth: "380px",
                    margin: "0 auto",
                  }}
                >
                  Your honest feedback helps us maintain transparency and empowers
                  other families to choose pure, authentic harvest.
                </p>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                style={{
                  marginTop: "1rem",
                  background: "var(--color-primary, #1F3A2E)",
                  color: "#FAF6EE",
                  border: "none",
                  borderRadius: "var(--radius-md, 8px)",
                  padding: "0.75rem 2rem",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(31, 58, 46, 0.2)",
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {error && (
                <div
                  style={{
                    background: "rgba(224, 83, 56, 0.08)",
                    border: "1px solid rgba(224, 83, 56, 0.3)",
                    color: "#C0392B",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-subheading)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Your Rating <span style={{ color: "#E05338" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{ display: "flex", gap: "4px" }}
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: "4px",
                          cursor: "pointer",
                          color: star <= activeRating ? "#D9A441" : "#D1D5DB",
                          transition: "transform 0.1s ease",
                          transform: hoverRating === star ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        <Star
                          size={26}
                          fill={star <= activeRating ? "#D9A441" : "none"}
                          stroke="currentColor"
                          strokeWidth={1.8}
                        />
                      </button>
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "#C4883E",
                      marginLeft: "0.35rem",
                    }}
                  >
                    {getRatingLabel(activeRating)}
                  </span>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label
                  htmlFor="review-name"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-subheading)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Your Name <span style={{ color: "#E05338" }}>*</span>
                </label>
                <input
                  id="review-name"
                  type="text"
                  required
                  placeholder="e.g. Subhashree or Rajesh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.9375rem",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D9A441")}
                  onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                />
              </div>

              {/* Email input (optional) */}
              <div>
                <label
                  htmlFor="review-email"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-subheading)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Email Address <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 400 }}>(optional, for verification)</span>
                </label>
                <input
                  id="review-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.9375rem",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D9A441")}
                  onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                />
              </div>

              {/* Review Text */}
              <div>
                <label
                  htmlFor="review-text"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-subheading)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Your Experience <span style={{ color: "#E05338" }}>*</span>
                </label>
                <textarea
                  id="review-text"
                  required
                  rows={4}
                  placeholder="Tell us about the aroma, colour, purity, or how you used this harvest..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.9375rem",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    resize: "vertical",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D9A441")}
                  onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={resetAndClose}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    background: "#F9FAFB",
                    color: "#4B5563",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B356 0%, #D9A441 100%)",
                    color: "#1F3A2E",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(217, 164, 65, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
