"use client";

import { useState } from "react";
import { ShoppingCart, Check, Zap, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  size?: "md" | "lg";
  showBuyNow?: boolean;
  isDetailPage?: boolean;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  size = "md",
  showBuyNow = true,
  isDetailPage = false,
}: AddToCartButtonProps) {
  const { items, addItem, updateQty, removeItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const primaryImage =
    product.images?.find((img) => img.is_primary) ??
    product.images?.[0] ?? null;

  const handleAdd = (andBuyNow = false) => {
    if (andBuyNow) {
      if (!cartItem) {
        addItem({
          productId: product.id,
          quantity,
          name: product.name,
          price: product.price,
          currency: product.currency,
          unit: product.unit ?? null,
          imageUrl: primaryImage?.image_url ?? product.image_url,
          imageAlt: primaryImage?.alt_text ?? product.name,
          slug: product.slug,
        });
      } else if (isDetailPage) {
        updateQty(product.id, quantity);
      }
      openDrawer();
      return;
    }

    if (cartItem && isDetailPage) {
      // On detail page: set quantity to user's selected value (e.g. 5)
      updateQty(product.id, quantity);
    } else {
      // On product grid / cards: accumulate quantity (+1)
      addItem({
        productId: product.id,
        quantity,
        name: product.name,
        price: product.price,
        currency: product.currency,
        unit: product.unit ?? null,
        imageUrl: primaryImage?.image_url ?? product.image_url,
        imageAlt: primaryImage?.alt_text ?? product.name,
        slug: product.slug,
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isLaunchingSoon =
    product.short_description?.toLowerCase().includes("launching soon") ||
    product.description?.toLowerCase().includes("launching soon");

  if (isLaunchingSoon) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        style={{
          width: "100%",
          borderColor: "#D9A441",
          color: "#B37E14",
          background: "#FFFBF0",
          fontWeight: 600,
          opacity: 0.95,
          cursor: "not-allowed",
        }}
        aria-label={`${product.name} is launching soon`}
      >
        🚀 Launching Soon
      </Button>
    );
  }

  if (product.stock_quantity === 0) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        style={{ width: "100%", opacity: 0.6 }}
        aria-label={`${product.name} is out of stock`}
      >
        Out of Stock
      </Button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      {/* Line 1: Add to Cart (On All Products grid: show interactive stepper when in cart) */}
      {!isDetailPage && cartItem ? (
        <div
          role="group"
          aria-label={`Quantity stepper for ${product.name}`}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: size === "lg" ? "3.25rem" : "2.5rem",
            border: "1.5px solid var(--color-primary)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            background: "var(--color-card)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (cartItem.quantity > 1) {
                updateQty(product.id, cartItem.quantity - 1);
              } else {
                removeItem(product.id);
              }
            }}
            aria-label={`Decrease quantity of ${product.name}`}
            style={{
              width: "2.75rem",
              height: "100%",
              border: "none",
              background: "var(--color-surface)",
              color: "var(--color-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s ease",
            }}
          >
            <Minus size={14} aria-hidden="true" />
          </button>

          <span
            aria-live="polite"
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--color-primary)",
            }}
          >
            {cartItem.quantity}
          </span>

          <button
            type="button"
            onClick={() => updateQty(product.id, cartItem.quantity + 1)}
            disabled={cartItem.quantity >= Math.min(product.stock_quantity, 50)}
            aria-label={`Increase quantity of ${product.name}`}
            style={{
              width: "2.75rem",
              height: "100%",
              border: "none",
              background: "var(--color-surface)",
              color: "var(--color-primary)",
              cursor: cartItem.quantity >= product.stock_quantity ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s ease",
              opacity: cartItem.quantity >= product.stock_quantity ? 0.4 : 1,
            }}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <Button
          variant={added ? "accent" : "outline"}
          size={size}
          onClick={() => handleAdd(false)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          aria-label={
            added
              ? `${product.name} added to cart`
              : `Add ${product.name} to cart`
          }
          id={`add-to-cart-${product.id}`}
        >
          {added ? (
            <>
              <Check size={16} aria-hidden="true" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart size={16} aria-hidden="true" />
              Add to Cart
            </>
          )}
        </Button>
      )}

      {/* Line 2: Buy Now */}
      {showBuyNow && (
        <Button
          variant="primary"
          size={size}
          onClick={() => handleAdd(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            background: "linear-gradient(135deg, #172D23 0%, #294A3B 100%)",
            border: "none",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(23, 45, 35, 0.15)",
          }}
          aria-label={`Buy ${product.name} now`}
          id={`buy-now-${product.id}`}
        >
          <Zap size={16} aria-hidden="true" fill="#D9A441" color="#D9A441" />
          Buy Now
        </Button>
      )}
    </div>
  );
}
