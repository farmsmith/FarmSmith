"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils/cn";
import AddToCartButton from "@/components/product/AddToCartButton";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

function getProductBadge(product: Product) {
  const isLaunchingSoon =
    product.short_description?.toLowerCase().includes("launching soon") ||
    product.description?.toLowerCase().includes("launching soon");

  if (isLaunchingSoon) {
    return { label: "LAUNCHING SOON", bg: "#D9A441", color: "#FFFFFF" };
  }
  if (product.stock_quantity < 5 && product.stock_quantity > 0) {
    return { label: "Limited Stock", bg: "#C0392B", color: "#FFF" };
  }
  if (product.name.toLowerCase().includes("turmeric") || product.name.toLowerCase().includes("ghee")) {
    return { label: "Bestseller", bg: "#1F3A2E", color: "#FFF" };
  }
  return { label: "GI-Tagged", bg: "#4A6B5D", color: "#FFF" };
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

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const isTurmeric =
    product.slug?.includes("turmeric") ||
    product.name?.toLowerCase().includes("turmeric");

  const slides =
    product.images && product.images.length > 1
      ? product.images.map((img) => img.image_url)
      : [
          product.image_url ?? "/images/product_turmeric.png",
          "/images/origin_story.png",
          "/images/recipe_golden_milk.png",
        ];

  // Auto-slide on hover pause
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const badge = getProductBadge(product);
  const currentImageUrl = slides[currentIdx];

  // Calculate review rating & count based on product id
  const rating = 4.9;
  const reviewCount = Math.floor(120 + (product.id.charCodeAt(0) % 50) * 7);

  const weightLabel = formatWeightLabel(product);

  return (
    <article
      aria-label={product.name}
      style={{
        background: "var(--color-card)",
        borderRadius: "var(--radius-xl)",
        border: isHovered ? "1px solid #D9A441" : "1px solid var(--color-border)",
        overflow: "hidden",
        boxShadow: isHovered ? "0 14px 36px rgba(31, 58, 46, 0.12)" : "0 2px 10px rgba(31, 58, 46, 0.04)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image Box */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "#F4EFE6", overflow: "hidden" }}>
        {/* Left Badge */}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              zIndex: 3,
              background: badge.bg,
              color: badge.color,
              fontSize: "0.6875rem",
              fontWeight: 700,
              padding: "0.25rem 0.625rem",
              borderRadius: "999px",
              letterSpacing: "0.03em",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}
          >
            {badge.label}
          </div>
        )}

        {/* Right Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            zIndex: 3,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            color: isWishlisted ? "#C0392B" : "#6B7A6B",
            transition: "transform 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Heart size={16} fill={isWishlisted ? "#C0392B" : "none"} />
        </button>

        {/* Product Image Link */}
        <Link
          href={`/shop/${product.slug}`}
          aria-label={`View details of ${product.name}`}
          style={{ display: "block", width: "100%", height: "100%", position: "relative" }}
        >
          {currentImageUrl ? (
            <Image
              key={currentImageUrl}
              src={currentImageUrl}
              alt={`${product.name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
      </div>

      {/* Card Info Body */}
      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Category Label */}
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: "0.25rem",
          }}
        >
          {product.category || "SPICES & ESSENTIALS"}
        </p>

        {/* Product Name & Weight Badge Row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Link href={`/shop/${product.slug}`} style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                lineHeight: 1.35,
              }}
            >
              {product.name}
            </h3>
          </Link>

          {weightLabel && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                background: "rgba(31, 58, 46, 0.06)",
                border: "1px solid rgba(31, 58, 46, 0.12)",
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginTop: "0.1rem",
                letterSpacing: "-0.01em",
              }}
            >
              {weightLabel}
            </span>
          )}
        </div>

        {/* Short spec line — Only shown for Turmeric */}
        {isTurmeric && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-muted)",
              marginBottom: "0.5rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            GI-Tagged Pure Batch
          </p>
        )}

        {/* Star Ratings — Only shown for Turmeric */}
        {isTurmeric && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.875rem" }}>
            <div style={{ display: "flex", color: "#D9A441", gap: "1px" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="#D9A441" stroke="none" />
              ))}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>
              {rating} ({reviewCount})
            </span>
          </div>
        )}

        {/* For Turmeric: Push actions to bottom of tall card. For non-turmeric: Keep button close to title */}
        {isTurmeric && <div style={{ flex: 1 }} />}

        {/* Price & Action Block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            paddingTop: "0.75rem",
            marginTop: isTurmeric ? "0" : "0.75rem",
            borderTop: "1px dashed var(--color-border)",
          }}
        >
          {/* Price line — Only shown for Turmeric */}
          {isTurmeric && (
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--color-primary)",
                }}
              >
                {formatPrice(product.price, product.currency)}
              </span>
              {product.unit && (
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 500 }}>
                  / {product.unit}
                </span>
              )}
            </div>
          )}

          {/* Add to Cart / Launching Soon Button */}
          <AddToCartButton product={product} size="md" />
        </div>
      </div>
    </article>
  );
}
