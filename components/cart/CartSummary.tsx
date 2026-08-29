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
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--color-muted)",
          marginBottom: "1rem",
        }}
      >
        Shipping and taxes calculated at checkout.
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
