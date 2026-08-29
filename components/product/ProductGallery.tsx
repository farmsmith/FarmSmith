"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  fallbackUrl?: string | null;
  productName: string;
}

export default function ProductGallery({
  images,
  fallbackUrl,
  productName,
}: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Build gallery: use DB images if available (>1), or supplement with product-specific extra views for full multi-image gallery
  const displayImages: ProductImage[] = useMemo(() => {
    if (images.length > 1) return images;

    const primaryUrl = images[0]?.image_url ?? fallbackUrl ?? "/images/product_turmeric.png";

    let farmUrl = "/images/origin_story.png";
    let useUrl = "/images/recipe_golden_milk.png";
    let testUrl = "/images/awareness_spices.png";

    if (primaryUrl.includes("mustard_oil")) {
      farmUrl = "/images/product_mustard_oil_farm.png";
      useUrl = "/images/product_mustard_oil_use.png";
      testUrl = "/images/product_mustard_oil_test.png";
    } else if (primaryUrl.includes("aromatic_rice")) {
      farmUrl = "/images/product_aromatic_rice_farm.png";
      useUrl = "/images/product_aromatic_rice_use.png";
      testUrl = "/images/product_aromatic_rice_test.png";
    } else if (primaryUrl.includes("arhar_daal")) {
      farmUrl = "/images/product_arhar_daal_farm.png";
      useUrl = "/images/product_arhar_daal_use.png";
      testUrl = "/images/product_arhar_daal_test.png";
    } else if (primaryUrl.includes("ancient_grains")) {
      farmUrl = "/images/product_ancient_grains_farm.png";
      useUrl = "/images/product_ancient_grains_use.png";
      testUrl = "/images/product_ancient_grains_test.png";
    }

    return [
      {
        id: "primary",
        product_id: "",
        image_url: primaryUrl,
        alt_text: `${productName} - Front Pack View`,
        sort_order: 0,
        is_primary: true,
        created_at: "",
      },
      {
        id: "farm-origin",
        product_id: "",
        image_url: farmUrl,
        alt_text: `${productName} - GI Certified Farm Sourcing`,
        sort_order: 1,
        is_primary: false,
        created_at: "",
      },
      {
        id: "usage-recipe",
        product_id: "",
        image_url: useUrl,
        alt_text: `${productName} - Culinary Preparation`,
        sort_order: 2,
        is_primary: false,
        created_at: "",
      },
      {
        id: "purity-test",
        product_id: "",
        image_url: testUrl,
        alt_text: `${productName} - Quality & Purity Inspection`,
        sort_order: 3,
        is_primary: false,
        created_at: "",
      },
    ];
  }, [images, fallbackUrl, productName]);

  // Auto-slide every 3.5s (pauses on hover)
  useEffect(() => {
    if (isHovered || displayImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, displayImages.length]);

  const active = displayImages[activeIdx] ?? displayImages[0];
  const prev = () => setActiveIdx((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === displayImages.length - 1 ? 0 : i + 1));

  return (
    <div>
      {/* Main image container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          maxWidth: "460px",
          width: "100%",
          margin: "0 auto 1rem",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <Image
          key={active.image_url}
          src={active.image_url}
          alt={active.alt_text ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          style={{ objectFit: "cover", transition: "opacity 0.2s ease" }}
        />

        {/* Counter Badge */}
        {displayImages.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: "0.875rem",
              right: "0.875rem",
              background: "rgba(31, 58, 46, 0.75)",
              backdropFilter: "blur(6px)",
              color: "#FBFAF6",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius-full)",
              zIndex: 2,
              letterSpacing: "0.05em",
            }}
          >
            {activeIdx + 1} / {displayImages.length}
          </div>
        )}

        {/* Navigation arrows (Next / Previous) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(251,250,246,0.92)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 3,
                color: "var(--color-primary)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "transform 0.15s ease, background 0.15s ease",
              }}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(251,250,246,0.92)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 3,
                color: "var(--color-primary)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "transform 0.15s ease, background 0.15s ease",
              }}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div
          role="list"
          aria-label="Product image thumbnails"
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: "460px",
            margin: "0 auto",
          }}
        >
          {displayImages.map((img, idx) => (
            <button
              key={img.id}
              role="listitem"
              onClick={() => setActiveIdx(idx)}
              aria-label={`View image ${idx + 1}: ${img.alt_text ?? productName}`}
              aria-pressed={idx === activeIdx}
              style={{
                width: "72px",
                height: "72px",
                position: "relative",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: idx === activeIdx
                  ? "2.5px solid var(--color-primary)"
                  : "1.5px solid var(--color-border)",
                opacity: idx === activeIdx ? 1 : 0.7,
                cursor: "pointer",
                background: "var(--color-surface)",
                padding: 0,
                transition: "border-color 0.15s, opacity 0.15s, transform 0.15s",
                transform: idx === activeIdx ? "scale(1.03)" : "scale(1)",
                flexShrink: 0,
              }}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text ?? `${productName} view ${idx + 1}`}
                fill
                sizes="72px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
