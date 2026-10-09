"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/context";
import { cartSubtotal, cartItemCount } from "@/lib/cart/reducer";
import { formatPrice } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { ShoppingBag } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

interface CartSummaryProps {
  onClose?: () => void;
}

export default function CartSummary({ onClose }: CartSummaryProps) {
  const { items } = useCart();
  const router = useRouter();
  const subtotal = cartSubtotal(items);
  const count = cartItemCount(items);

  const handleCheckout = async () => {
    onClose?.();
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "1.25rem 1.5rem",
        background: "var(--color-card)",
      }}
    >
      {/* Subtotal */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
          Subtotal ({count} {count === 1 ? "item" : "items"})
        </span>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "var(--color-primary)",
          }}
        >
          {formatPrice(subtotal)}
        </span>
      </div>
      {subtotal >= 645 ? (
        <div
          style={{
            fontSize: "0.8125rem",
            color: "#15803D",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            fontWeight: 600,
          }}
        >
          <span>🚚</span>
          <span>You&apos;ve unlocked <strong>FREE Shipping</strong>!</span>
        </div>
      ) : (
        <div
          style={{
            fontSize: "0.8125rem",
            color: "#9A3412",
            background: "#FFFBEB",
            border: "1px solid #FED7AA",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          <span>🚚</span>
          <span>
            Add <strong>{formatPrice(645 - subtotal)}</strong> more for <strong>FREE Shipping</strong>
          </span>
        </div>
      )}

      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--color-muted)",
          marginBottom: "1rem",
        }}
      >
        Delivery charges calculated automatically based on your location.
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={handleCheckout}
        style={{ width: "100%" }}
        id="cart-checkout-btn"
      >
        <ShoppingBag size={18} aria-hidden="true" />
        Proceed to Checkout
      </Button>
    </div>
  );
}
