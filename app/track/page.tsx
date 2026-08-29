import type { Metadata } from "next";
import OrderTrackingForm from "@/components/order/OrderTrackingForm";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your FarmSmith Foods order using your order number and tracking token.",
};

export default function TrackPage() {
  return (
    <div
      style={{
        background: "var(--color-background)",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        paddingBlock: "3rem",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Order Tracking</p>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              color: "var(--color-primary)",
              marginBottom: "0.75rem",
            }}
          >
            Where's your order?
          </h1>
          <p
            style={{
              color: "var(--color-muted)",
              marginBottom: "2rem",
              lineHeight: 1.7,
            }}
          >
            Enter your order number and tracking token from your confirmation
            email to see the latest status.
          </p>

          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <OrderTrackingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
