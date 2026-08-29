"use client";

import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/utils/cn";
import type { CartItem } from "@/lib/cart/types";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQty, removeItem } = useCart();

  return (
    <div
      style={{
        display: "flex",
        gap: "0.875rem",
        padding: "1rem 0",
        borderBottom: "1px solid var(--color-border)",
        alignItems: "flex-start",
      }}
    >
      {/* Product image */}
      <div
        style={{
          width: "68px",
          height: "68px",
          flexShrink: 0,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          background: "var(--color-surface)",
          position: "relative",
        }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt ?? item.name}
            fill
            sizes="68px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--color-muted-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            🌿
          </div>
        )}
      </div>

      {/* Info + controls */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "0.9375rem",
            color: "var(--color-primary)",
            marginBottom: "0.125rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </p>
        {item.unit && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--color-muted)",
              marginBottom: "0.625rem",
            }}
          >
            {item.unit}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          {/* Qty stepper */}
          <div
            role="group"
            aria-label={`Quantity for ${item.name}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => updateQty(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.name}`}
              style={{
                width: "28px",
                height: "28px",
                border: "none",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
                cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                opacity: item.quantity <= 1 ? 0.4 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Minus size={12} aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              style={{
                padding: "0 0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-foreground)",
                minWidth: "2rem",
                textAlign: "center",
              }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => updateQty(item.productId, item.quantity + 1)}
              disabled={item.quantity >= 50}
              aria-label={`Increase quantity of ${item.name}`}
              style={{
                width: "28px",
                height: "28px",
                border: "none",
                background: "var(--color-surface)",
                color: "var(--color-foreground)",
                cursor: item.quantity >= 50 ? "not-allowed" : "pointer",
                opacity: item.quantity >= 50 ? 0.4 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={12} aria-hidden="true" />
            </button>
          </div>

          {/* Price */}
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.9375rem",
              color: "var(--color-primary)",
            }}
          >
            {formatPrice(item.price * item.quantity, item.currency)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.productId)}
        aria-label={`Remove ${item.name} from cart`}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-muted)",
          cursor: "pointer",
          padding: "0.25rem",
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
