import type { OrderStatus } from "@/types/order";

interface Step {
  status: OrderStatus;
  label: string;
  description: string;
}

const ORDER_STEPS: Step[] = [
  { status: "pending_payment", label: "Order Placed", description: "Your order has been placed." },
  { status: "paid", label: "Payment Confirmed", description: "Payment received and verified." },
  { status: "processing", label: "Processing", description: "We're preparing your order." },
  { status: "shipped", label: "Shipped", description: "Your order is on its way." },
  { status: "delivered", label: "Delivered", description: "Order delivered. Enjoy!" },
];

const STATUS_ORDER: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
];

function getStepIndex(status: OrderStatus): number {
  if (status === "cancelled" || status === "refunded" || status === "payment_captured_after_expiry") return -1;
  return STATUS_ORDER.indexOf(status);
}

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

export default function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const currentIdx = getStepIndex(status);

  if (status === "cancelled") {
    return (
      <div
        style={{
          background: "var(--color-error-bg)",
          border: "1px solid var(--color-error)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          color: "var(--color-error)",
          fontWeight: 500,
          fontSize: "0.9rem",
        }}
        role="status"
      >
        This order has been cancelled.
      </div>
    );
  }

  if (status === "refunded") {
    return (
      <div
        style={{
          background: "#FFF8E1",
          border: "1px solid #F9A825",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          color: "#795548",
          fontWeight: 500,
          fontSize: "0.9rem",
        }}
        role="status"
      >
        This order has been refunded.
      </div>
    );
  }

  return (
    <ol
      aria-label="Order status timeline"
      style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0, position: "relative" }}
    >
      {ORDER_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const future = idx > currentIdx;

        return (
          <li
            key={step.status}
            aria-current={active ? "step" : undefined}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              paddingBottom: idx < ORDER_STEPS.length - 1 ? "1.5rem" : 0,
              position: "relative",
            }}
          >
            {/* Connector line */}
            {idx < ORDER_STEPS.length - 1 && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "30px",
                  bottom: 0,
                  width: "2px",
                  background: done
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                  transition: "background 0.3s",
                }}
              />
            )}

            {/* Circle indicator */}
            <div
              aria-hidden="true"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: 700,
                background: done
                  ? "var(--color-primary)"
                  : active
                  ? "var(--color-accent)"
                  : "var(--color-muted-bg)",
                color: done
                  ? "var(--color-card)"
                  : active
                  ? "var(--color-primary)"
                  : "var(--color-muted)",
                border: active
                  ? "2px solid var(--color-accent)"
                  : "2px solid transparent",
                transition: "all 0.3s",
                zIndex: 1,
              }}
            >
              {done ? "✓" : idx + 1}
            </div>

            {/* Step text */}
            <div style={{ paddingTop: "4px" }}>
              <p
                style={{
                  fontWeight: active ? 700 : done ? 600 : 400,
                  fontSize: "0.9375rem",
                  color: future ? "var(--color-muted)" : "var(--color-primary)",
                  marginBottom: "0.2rem",
                }}
              >
                {step.label}
              </p>
              {(done || active) && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
