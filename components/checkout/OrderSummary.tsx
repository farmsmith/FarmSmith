import { formatPrice } from "@/lib/utils/cn";
import type { CartItem } from "@/lib/cart/types";

interface QuoteData {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  quote?: QuoteData | null;
  loading?: boolean;
}

export default function OrderSummary({ items, quote, loading }: OrderSummaryProps) {
  const currency = items[0]?.currency ?? "INR";
  const clientSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.125rem",
          color: "var(--color-primary)",
          marginBottom: "1.25rem",
        }}
      >
        Order Summary
      </h2>

      {/* Items */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((item) => (
          <li
            key={item.productId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <span style={{ color: "var(--color-foreground)", flex: 1 }}>
              {item.name}
              {item.unit && (
                <span style={{ color: "var(--color-muted)", fontSize: "0.75rem" }}>
                  {" "}({item.unit})
                </span>
              )}
              <span style={{ color: "var(--color-muted)", marginLeft: "0.25rem" }}>
                × {item.quantity}
              </span>
            </span>
            <span style={{ fontWeight: 600, color: "var(--color-primary)", flexShrink: 0 }}>
              {formatPrice(item.price * item.quantity, item.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {/* Subtotal */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--color-muted)" }}>Subtotal</span>
          <span style={{ color: "var(--color-foreground)" }}>
            {quote ? formatPrice(quote.subtotal, quote.currency) : formatPrice(clientSubtotal, currency)}
          </span>
        </div>

        {/* Shipping */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--color-muted)" }}>Shipping</span>
          {loading ? (
            <span className="skeleton" style={{ width: "60px", height: "1rem" }} />
          ) : quote ? (
            <span style={{ color: "var(--color-foreground)" }}>
              {formatPrice(quote.shipping, quote.currency)}
            </span>
          ) : (
            <span style={{ color: "var(--color-muted)", fontStyle: "italic" }}>Enter address</span>
          )}
        </div>

        {/* Tax */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--color-muted)" }}>GST</span>
          {loading ? (
            <span className="skeleton" style={{ width: "50px", height: "1rem" }} />
          ) : quote ? (
            <span style={{ color: "var(--color-foreground)" }}>
              {formatPrice(quote.tax, quote.currency)}
            </span>
          ) : (
            <span style={{ color: "var(--color-muted)", fontStyle: "italic" }}>—</span>
          )}
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: "1rem" }}>Total</span>
          {loading ? (
            <span className="skeleton" style={{ width: "80px", height: "1.25rem" }} />
          ) : quote ? (
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--color-primary)",
              }}
            >
              {formatPrice(quote.total, quote.currency)}
            </span>
          ) : (
            <span style={{ color: "var(--color-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>
              Calculated after address
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
