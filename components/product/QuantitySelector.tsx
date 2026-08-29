"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "@/types/product";

interface QuantitySelectorProps {
  product: Product;
}

export default function QuantitySelector({ product }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const maxQty = Math.min(product.stock_quantity, 50);

  const isLaunchingSoon =
    product.short_description?.toLowerCase().includes("launching soon") ||
    product.description?.toLowerCase().includes("launching soon") ||
    (!product.slug?.includes("turmeric") && !product.name?.toLowerCase().includes("turmeric"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Quantity row — Only shown for available products (e.g. Turmeric) */}
      {!isLaunchingSoon && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-foreground)" }}>
            Quantity
          </span>
          <div
            role="group"
            aria-label="Select quantity"
            style={{
              display: "flex",
              alignItems: "center",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              style={{
                width: "40px",
                height: "40px",
                border: "none",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
                cursor: quantity <= 1 ? "not-allowed" : "pointer",
                opacity: quantity <= 1 ? 0.4 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => quantity > 1 && ((e.currentTarget as HTMLElement).style.background = "var(--color-muted-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface)")}
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              style={{
                padding: "0 1.25rem",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--color-foreground)",
                minWidth: "3rem",
                textAlign: "center",
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              aria-label="Increase quantity"
              style={{
                width: "40px",
                height: "40px",
                border: "none",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
                cursor: quantity >= maxQty ? "not-allowed" : "pointer",
                opacity: quantity >= maxQty ? 0.4 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => quantity < maxQty && ((e.currentTarget as HTMLElement).style.background = "var(--color-muted-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface)")}
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <AddToCartButton product={product} quantity={quantity} size="lg" isDetailPage={true} />
    </div>
  );
}
