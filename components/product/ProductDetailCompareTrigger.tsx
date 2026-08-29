"use client";

import { useState } from "react";
import { BarChart2, ShieldCheck, Sparkles } from "lucide-react";
import ProductComparisonModal from "@/components/product/ProductComparisonModal";
import type { Product } from "@/types/product";

interface ProductDetailCompareTriggerProps {
  product: Product;
}

export default function ProductDetailCompareTrigger({ product }: ProductDetailCompareTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        style={{
          marginTop: "1.25rem",
          padding: "1rem 1.25rem",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #F4F7F4 0%, #E8F0E9 100%)",
          border: "1.5px solid #C4D6C6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#2E4D32",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1C352D" }}>
              Why choose Farmsmith {product.name}?
            </div>
            <div style={{ fontSize: "0.75rem", color: "#556B58", fontWeight: 500 }}>
              0% Adulteration · Cold-Pressed Processing · Verified Reviews
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.55rem 1rem",
            borderRadius: "8px",
            background: "#2E4D32",
            color: "#FFFFFF",
            fontSize: "0.8125rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(46, 77, 50, 0.2)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1C352D")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2E4D32")}
        >
          <BarChart2 size={15} style={{ color: "#D9A441" }} />
          Compare vs. Market Standard
        </button>
      </div>

      <ProductComparisonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={product}
      />
    </>
  );
}
