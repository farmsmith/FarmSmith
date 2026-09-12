"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils/cn";
import AddToCartButton from "@/components/product/AddToCartButton";
import type { Product } from "@/types/product";

interface FeaturedProductShowcaseProps {
  product: Product;
}

function formatWeightLabel(product: Product): string | null {
  if (product.weight_grams && product.weight_grams > 0) {
    if (product.weight_grams >= 1000 && product.weight_grams % 1000 === 0) {
      return `${product.weight_grams / 1000}kg`;
    }
    return `${product.weight_grams}g`;
  }
  if (product.unit && /^\d+(g|kg|ml|l)$/i.test(product.unit.trim())) {
    return product.unit.trim();
  }
  return null;
}

export default function FeaturedProductShowcase({ product }: FeaturedProductShowcaseProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides =
    product.images && product.images.length > 1
      ? product.images.map((img) => img.image_url)
      : [
          product.image_url ?? "/images/product_turmeric.png",
          "/images/origin_story.png",
          "/images/recipe_golden_milk.png",
        ];

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const currentImageUrl = slides[currentIdx];
  const weightLabel = formatWeightLabel(product);

  return (
    <section
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
          {/* LEFT: Standalone Product Image Box */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              maxWidth: "480px",
              margin: "0 auto",
              borderRadius: "var(--radius-xl, 18px)",
              overflow: "hidden",
              background: "#F4EFE6",
              border: "1px solid var(--color-border)",
              boxShadow: "0 12px 36px rgba(31, 58, 46, 0.08)",
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

            {/* Main Carousel Image */}
            <Link
              href={`/shop/${product.slug}`}
              aria-label={`View details of ${product.name}`}
              style={{ display: "block", width: "100%", height: "100%", position: "relative" }}
            >
              {currentImageUrl ? (
                <Image
                  key={currentImageUrl}
                  src={currentImageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                  priority
                />
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

            {/* Pagination Indicators (Dots inside image) */}
            {slides.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "0.4rem",
                  zIndex: 10,
                  background: "rgba(0,0,0,0.3)",
                  padding: "0.35rem 0.6rem",
                  borderRadius: "20px",
                  backdropFilter: "blur(4px)",
                }}
              >
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIdx(idx);
                    }}
                    aria-label={`View image ${idx + 1}`}
                    style={{
                      width: currentIdx === idx ? "20px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      background: currentIdx === idx ? "#D9A441" : "rgba(255, 255, 255, 0.6)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Standalone Content Block with Attached Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              paddingInline: "clamp(0rem, 2vw, 1rem)",
            }}
          >
            {/* Attached Section Header - Centered */}
            <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
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
            <div>
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
              }}
            >
              <div>• Batch tested for Purity</div>
              <div>• GI-registered Origin</div>
            </div>



            {/* Price & Unit */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.25rem" }}>
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
            <div style={{ maxWidth: "300px", marginTop: "0.5rem" }}>
              <AddToCartButton product={product} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
