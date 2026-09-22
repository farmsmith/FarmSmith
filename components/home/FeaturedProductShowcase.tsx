"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageSquarePlus, ChevronLeft, ChevronRight } from "lucide-react";
import AddToCartButton from "@/components/product/AddToCartButton";
import type { Product } from "@/types/product";

const AddReviewModal = dynamic(
  () => import("@/components/product/AddReviewModal"),
  { ssr: false }
);

interface FeaturedProductShowcaseProps {
  product: Product;
}

export default function FeaturedProductShowcase({ product }: FeaturedProductShowcaseProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAssembled, setIsAssembled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAssembled(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isTurmeric =
    product.slug?.includes("turmeric") ||
    product.name?.toLowerCase().includes("turmeric");

  const slides = isTurmeric
    ? [
        "/images/Product 1.PNG",
        "/images/Product 2.PNG",
        "/images/Product 3.PNG",
        "/images/Product 4.PNG",
      ]
    : product.images && product.images.length > 1
      ? product.images.map((img) => img.image_url)
      : [
          product.image_url ?? "/images/Product 1.PNG",
          "/images/Product 2.PNG",
          "/images/Product 3.PNG",
          "/images/Product 4.PNG",
        ];

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const prevSlide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      ref={sectionRef}
      id="featured-harvest"
      className="section"
      aria-labelledby="featured-heading"
      style={{ background: "var(--color-background)", paddingBlock: "4.5rem", scrollMarginTop: "5rem" }}
    >
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1.25rem" }}>
        {/* 2-Column Split: Standalone Image Left, Standalone Content Right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(2rem, 5vw, 4rem)",
            alignItems: "center",
          }}
        >
          {/* LEFT: Standalone Product Image Box with Thumbnail Selector */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
              width: "100%",
              maxWidth: "480px",
              margin: "0 auto",
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled
                ? "translateX(0) scale(1)"
                : "translateX(-85px) scale(0.92)",
              transition:
                "transform 2.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.75s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 2.75s ease",
            }}
          >
            {/* Main Carousel Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "var(--radius-xl, 18px)",
                overflow: "hidden",
                background: "#F4EFE6",
                border: "1px solid var(--color-border)",
                boxShadow: isAssembled
                  ? "0 16px 40px rgba(31, 58, 46, 0.12)"
                  : "0 4px 12px rgba(31, 58, 46, 0.04)",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsWishlisted(!isWishlisted);
                }}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  zIndex: 10,
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "transform 0.15s ease",
                }}
              >
                <Heart
                  size={20}
                  color={isWishlisted ? "#E05338" : "#1F3A2E"}
                  fill={isWishlisted ? "#E05338" : "none"}
                />
              </button>

              {/* Main Carousel Image Link with Slow Fade-in Crossfade */}
              <Link
                href={`/shop/${product.slug}`}
                aria-label={`View details of ${product.name}`}
                style={{ display: "block", width: "100%", height: "100%", position: "relative" }}
              >
                {slides.length > 0 ? (
                  slides.map((imgUrl, idx) => {
                    const isActive = idx === currentIdx;
                    return (
                      <div
                        key={imgUrl}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: isActive ? 1 : 0,
                          pointerEvents: isActive ? "auto" : "none",
                          transition: "opacity 2.5s cubic-bezier(0.25, 1, 0.5, 1), transform 2.8s cubic-bezier(0.25, 1, 0.5, 1)",
                          transform: isActive
                            ? (isHovered ? "scale(1.05)" : "scale(1)")
                            : "scale(1.03)",
                          zIndex: isActive ? 2 : 1,
                        }}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.name} - View ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 480px"
                          style={{ objectFit: "cover" }}
                          priority={idx === 0}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "3rem",
                    }}
                  >
                    🌿
                  </div>
                )}
              </Link>

              {/* Navigation Arrows (Prev / Next) */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    aria-label="Previous image"
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "rgba(251, 250, 246, 0.92)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 10,
                      boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                      transition: "background 0.2s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#D9A441";
                      e.currentTarget.style.color = "#1F3A2E";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(251, 250, 246, 0.92)";
                      e.currentTarget.style.color = "var(--color-primary)";
                    }}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>

                  <button
                    onClick={nextSlide}
                    aria-label="Next image"
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "rgba(251, 250, 246, 0.92)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 10,
                      boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                      transition: "background 0.2s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#D9A441";
                      e.currentTarget.style.color = "#1F3A2E";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(251, 250, 246, 0.92)";
                      e.currentTarget.style.color = "var(--color-primary)";
                    }}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </>
              )}

              {/* Counter Badge (Top-left) */}
              {slides.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    zIndex: 10,
                    background: "rgba(23, 45, 35, 0.75)",
                    backdropFilter: "blur(6px)",
                    color: "#FBFAF6",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "100px",
                    border: "1px solid rgba(217, 164, 65, 0.4)",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span style={{ color: "#D9A441" }}>{currentIdx + 1}</span> / {slides.length}
                </div>
              )}
            </div>

            {/* Thumbnail Selector Strip to click and move to next images */}
            {slides.length > 1 && (
              <div
                role="list"
                aria-label="Product images selector"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.65rem",
                  width: "100%",
                }}
              >
                {slides.map((imgUrl, idx) => {
                  const isActive = currentIdx === idx;
                  return (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentIdx(idx);
                      }}
                      aria-label={`View image ${idx + 1}`}
                      aria-pressed={isActive}
                      style={{
                        position: "relative",
                        width: "68px",
                        height: "68px",
                        borderRadius: "var(--radius-md, 10px)",
                        overflow: "hidden",
                        border: isActive
                          ? "2.5px solid #D9A441"
                          : "1.5px solid var(--color-border)",
                        background: "#F4EFE6",
                        cursor: "pointer",
                        padding: 0,
                        opacity: isActive ? 1 : 0.65,
                        transform: isActive ? "scale(1.04)" : "scale(1)",
                        boxShadow: isActive
                          ? "0 4px 12px rgba(217, 164, 65, 0.35)"
                          : "0 2px 5px rgba(0,0,0,0.06)",
                        transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="68px"
                        style={{ objectFit: "cover" }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Standalone Content Block with Staggered Text Sliding in slowly from Right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              paddingInline: "clamp(0rem, 2vw, 1rem)",
              overflow: "visible",
            }}
          >
            {/* Attached Section Header - Centered */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "0.25rem",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(95px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
              }}
            >
              <p
                className="eyebrow"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "#C4883E",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "0.35rem",
                }}
              >
                Our Featured Harvest
              </p>
              <h2
                id="featured-heading"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.85rem, 4vw, 2.6rem)",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Where we chose to <span style={{ color: "#C4883E" }}>begin</span>
              </h2>
            </div>

            {/* Product Title */}
            <div
              style={{
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(90px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
              }}
            >
              <Link href={`/shop/${product.slug}`} style={{ textDecoration: "none" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-subheading)",
                    fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
                    fontWeight: 500,
                    color: "var(--color-primary)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Kandhamal Turmeric, the golden goodness
                </h3>
              </Link>
            </div>

            {/* Product Story / Description */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                fontWeight: 400,
                lineHeight: 1.7,
                color: "var(--color-muted)",
                margin: 0,
                maxWidth: "520px",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(85px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
              }}
            >
              Single origin turmeric from kandhamal, Odisha— Thoughtfully selected, packed and presented with the information behind the batch.
            </p>

            {/* Spec points */}
            <div
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-muted)",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                lineHeight: 1.5,
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(80px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
              }}
            >
              <div>• Batch tested for Purity</div>
              <div>• GI-registered Origin</div>
            </div>

            {/* Review Product Trigger */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(75px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
              }}
            >
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(217, 164, 65, 0.1)",
                  border: "1px solid rgba(217, 164, 65, 0.35)",
                  color: "#B47B2E",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "100px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(217, 164, 65, 0.2)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(217, 164, 65, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <MessageSquarePlus size={15} color="#C4883E" />
                Review the product
              </button>
            </div>

            {/* Price & Unit */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.5rem",
                marginTop: "0.25rem",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(70px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                }}
              >
                ₹129
              </span>
              <span style={{ fontSize: "0.9375rem", color: "var(--color-muted)", fontFamily: "var(--font-body)", fontWeight: 500 }}>
                / 100g
              </span>
            </div>

            {/* Add to Cart Button */}
            <div
              style={{
                maxWidth: "300px",
                marginTop: "0.5rem",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(65px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
              }}
            >
              <AddToCartButton product={product} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Review Modal */}
      {isReviewModalOpen && (
        <AddReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          productName={product.name || "Kandhamal Turmeric"}
        />
      )}
    </section>
  );
}
