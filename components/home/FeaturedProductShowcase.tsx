"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ArrowRight } from "lucide-react";
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
  const rating = 4.9;
  const reviewCount = Math.floor(120 + (product.id.charCodeAt(0) % 50) * 7);

  return (
    <section
      className="section"
      aria-labelledby="featured-heading"
      style={{ background: "var(--color-background)", paddingBlock: "4.5rem" }}
    >
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingInline: "1.25rem" }}>
        {/* Section Heading on Top */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            className="eyebrow"
            style={{
              color: "#C4883E",
              fontSize: "0.8125rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Our Featured Harvest
          </p>
          <h2
            id="featured-heading"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--color-primary)",
              lineHeight: 1.2,
            }}
          >
            Where we chose to <span style={{ color: "#C4883E" }}>begin</span>
          </h2>
        </div>

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
                zIndex: 3,
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(6px)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                color: isWishlisted ? "#C0392B" : "#6B7A6B",
                transition: "transform 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Heart size={18} fill={isWishlisted ? "#C0392B" : "none"} />
            </button>

            {/* Main Product Image */}
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
                    transition: "transform 0.5s ease",
                    transform: isHovered ? "scale(1.04)" : "scale(1)",
                  }}
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

            {/* Thumbnail Indicators */}
            {slides.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 3,
                  display: "flex",
                  gap: "0.375rem",
                  background: "rgba(0, 0, 0, 0.35)",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "999px",
                  backdropFilter: "blur(4px)",
                }}
              >
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    style={{
                      width: currentIdx === i ? "18px" : "6px",
                      height: "6px",
                      borderRadius: "999px",
                      border: "none",
                      background: currentIdx === i ? "#D9A441" : "rgba(255,255,255,0.65)",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Standalone Content Block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              paddingInline: "clamp(0rem, 2vw, 1rem)",
            }}
          >
            {/* Product Title */}
            <div>
              <Link href={`/shop/${product.slug}`} style={{ textDecoration: "none" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  Kandhamal Turmeric, the golden goodness
                </h3>
              </Link>
            </div>

            {/* Product Story / Description */}
            <p
              style={{
                fontSize: "1rem",
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
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.625rem",
              }}
            >
              <span>•</span>
              <span>GI-registered Origin</span>
              <span>•</span>
              <span>Batch tested</span>
            </div>

            {/* Star Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ display: "flex", color: "#D9A441", gap: "2px" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#D9A441" stroke="none" />
                ))}
              </div>
              <span style={{ fontSize: "0.875rem", color: "var(--color-muted)", fontWeight: 600 }}>
                {rating} ({reviewCount} reviews)
              </span>
            </div>

            {/* Price & Unit */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.25rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.875rem",
                  fontWeight: 800,
                  color: "var(--color-primary)",
                }}
              >
                ₹129
              </span>
              <span style={{ fontSize: "0.9375rem", color: "var(--color-muted)", fontWeight: 500 }}>
                / 100g
              </span>
            </div>

            {/* Add to Cart Button */}
            <div style={{ maxWidth: "300px", marginTop: "0.5rem" }}>
              <AddToCartButton product={product} size="lg" />
            </div>
          </div>
        </div>

        {/* BOTTOM: Centered Explore Button */}
        <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "linear-gradient(135deg, #E2B356 0%, #D9A441 100%)",
              color: "#1F3A2E",
              fontWeight: 800,
              fontSize: "0.9375rem",
              textDecoration: "none",
              padding: "0.9375rem 2.25rem",
              borderRadius: "999px",
              boxShadow: "0 6px 20px rgba(217, 164, 65, 0.35)",
              transition: "all 0.2s ease",
            }}
          >
            Explore more Farmsmith products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
