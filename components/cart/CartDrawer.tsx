"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import { Button } from "@/components/ui/Button";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management — focus close button when drawer opens
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div style={{ display: open ? "block" : "none" }}>
      {/* Overlay */}
      <div
        className="cart-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <ShoppingBag
              size={20}
              style={{ color: "var(--color-primary)" }}
              aria-hidden="true"
            />
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                margin: 0,
              }}
            >
              Your Cart
            </h2>
            {items.length > 0 && (
              <span
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-card)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  padding: "0.125rem 0.5rem",
                }}
              >
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close cart"
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-foreground)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Items list or empty state */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 1.5rem",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                padding: "3rem 0",
                textAlign: "center",
              }}
            >
              <ShoppingBag
                size={48}
                style={{ color: "var(--color-muted)", opacity: 0.4 }}
                aria-hidden="true"
              />
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.125rem",
                  color: "var(--color-primary)",
                }}
              >
                Your cart is empty
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                Add something wholesome to get started.
              </p>
              <Link href="/shop" onClick={onClose} style={{ textDecoration: "none" }}>
                <Button variant="primary" size="md">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Summary + Checkout (only when cart has items) */}
        {items.length > 0 && <CartSummary onClose={onClose} />}
      </div>
    </div>
  );
}
