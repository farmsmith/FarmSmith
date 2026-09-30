"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import { formatPrice } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Button } from "@/components/ui/Button";
import { ErrorState, OfflineState, LoadingState } from "@/components/ui/states";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import type { PublicOrderStatus, OrderStatus } from "@/types/order";

function statusVariant(status: OrderStatus): "success" | "warning" | "error" | "muted" | "default" {
  switch (status) {
    case "paid":
    case "processing":
    case "shipped":
    case "delivered":
      return "success";
    case "pending_payment":
      return "warning";
    case "cancelled":
    case "refunded":
      return "error";
    default:
      return "muted";
  }
}

function statusLabel(status: OrderStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const sectionCardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
  padding: "1.5rem",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  transition: "box-shadow 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  color: "var(--color-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  display: "block",
  marginBottom: "0.2rem",
};

export default function OrderConfirmationClient() {
  const { isOnline } = useNetworkStatus();
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const identifier =
    searchParams.get("identifier") ||
    searchParams.get("token") ||
    searchParams.get("phone") ||
    searchParams.get("email") ||
    "";
  const { orderNumber } = params;

  const [order, setOrder] = useState<PublicOrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(
    async (isRefresh = false) => {
      if (!identifier) {
        setError("Missing order verification details. Please track using your mobile number, email, or tracking link.");
        setLoading(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber, identifier }),
        });

        if (res.status === 404) {
          setError("Order not found. Please verify your order number and mobile number / email.");
          return;
        }
        if (!res.ok) {
          setError("Failed to fetch order status. Please try again.");
          return;
        }
        const data = (await res.json()) as PublicOrderStatus;
        setOrder(data);
      } catch {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderNumber, identifier]
  );

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "80vh", paddingBlock: "3rem", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "20px", padding: "clamp(1.5rem, 4vw, 2.5rem)", boxShadow: "var(--shadow-card)" }}>
            <LoadingState layout="section" title="Loading order details..." description={`Fetching information for order #${orderNumber}...`} className="py-12" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ background: "var(--color-background)", minHeight: "80vh", paddingBlock: "3rem", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)" }}>
        <div className="container" style={{ maxWidth: "560px" }}>
          <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "20px", padding: "2rem", boxShadow: "var(--shadow-card)" }}>
            {error && !isOnline ? (
              <OfflineState layout="card" title="You're offline" description="We couldn't retrieve this order because your device is not connected to the internet." primaryAction={{ label: "Try Again", onClick: () => void fetchOrder(true) }} secondaryAction={{ label: "Track an Order", href: "/track" }} className="py-6" />
            ) : (
              <ErrorState layout="card" title="Could not load order" description={error ?? "We couldn't retrieve this order. Please verify your order number and tracking key."} primaryAction={{ label: "Try Again", onClick: () => void fetchOrder(true) }} secondaryAction={{ label: "Back to Track", href: "/track" }} className="py-6" />
            )}
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasShipment = Boolean(order.awb_code && order.awb_code.trim().length > 0);
  const canTrack =
    order.status !== "cancelled" &&
    order.status !== "refunded" &&
    order.status !== "pending_payment";

  const isPaid = ["paid", "processing", "shipped", "delivered"].includes(order.status);

  return (
    <div
      style={{
        background: "var(--color-background)",
        minHeight: "80vh",
        paddingBlock: "2.5rem 4rem",
        fontFamily: "var(--font-body)",
        fontWeight: 400,
      }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .order-card { animation: fadeSlideUp 0.45s ease both; }
        .order-card:nth-child(1) { animation-delay: 0.05s; }
        .order-card:nth-child(2) { animation-delay: 0.12s; }
        .order-card:nth-child(3) { animation-delay: 0.19s; }
        .order-card:nth-child(4) { animation-delay: 0.26s; }
        .section-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.13) !important; }
        .back-link:hover { color: var(--color-primary) !important; }
        .row-item:hover { background: rgba(255,255,255,0.04); border-radius: 8px; margin-inline: -0.5rem; padding-inline: 0.5rem; }
      `}</style>

      <div className="container" style={{ maxWidth: "960px" }}>

        {/* ── Top Nav Bar ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }} className="order-card">
          <Link
            href="/track"
            className="back-link"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.875rem", fontFamily: "var(--font-subheading)", fontWeight: 500,
              color: "var(--color-muted)", textDecoration: "none", transition: "color 0.15s ease",
            }}
          >
            <ArrowLeft size={16} /> Back to Track Order
          </Link>
          <Button variant="ghost" size="icon-sm" onClick={() => fetchOrder(true)} aria-label="Refresh order status" loading={refreshing} title="Refresh order status">
            <RefreshCw size={14} aria-hidden="true" />
          </Button>
        </div>

        {/* ── Hero Header Card ── */}
        <div
          className="order-card"
          style={{
            background: "linear-gradient(135deg, #1F3A2E 0%, #2A4D3A 50%, #1a3529 100%)",
            borderRadius: "20px",
            padding: "clamp(1.75rem, 4vw, 2.5rem)",
            marginBottom: "1.5rem",
            boxShadow: "0 8px 40px rgba(31,58,46,0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative blobs */}
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "30%", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem", position: "relative" }}>
            <div>
              {/* Order confirmed pill */}
              {isPaid && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  background: "rgba(255,255,255,0.12)", borderRadius: "999px",
                  padding: "0.25rem 0.75rem", marginBottom: "0.75rem",
                  fontSize: "0.78rem", fontFamily: "var(--font-subheading)", fontWeight: 600,
                  color: "#a8e6c0", letterSpacing: "0.04em",
                }}>
                  <CheckCircle2 size={13} /> ORDER CONFIRMED
                </div>
              )}

              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 0.4rem",
                letterSpacing: "0.01em",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span>Order</span>
                <code style={{
                  background: "rgba(255,255,255,0.12)",
                  padding: "2px 12px", borderRadius: "8px",
                  fontFamily: "monospace", fontWeight: 700,
                  color: "#FFFFFF", fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                  letterSpacing: "0.03em",
                }}>
                  #{order.order_number}
                </code>
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                <p style={{ fontSize: "0.875rem", fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.65)", margin: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Calendar size={14} /> Placed on {formattedDate}
                </p>

                {order.tracking_token && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}>
                    <span>Tracking Key:</span>
                    <code style={{ background: "rgba(255,255,255,0.12)", padding: "2px 8px", borderRadius: "6px", fontFamily: "monospace", fontWeight: 600, color: "#FFFFFF", fontSize: "0.8125rem" }}>
                      {order.tracking_token}
                    </code>
                    <CopyButton text={order.tracking_token} label="Copy Tracking Key" />
                  </div>
                )}

                {order.awb_code && order.awb_code.trim().length > 0 && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}>
                    <span>AWB No:</span>
                    <code style={{ background: "rgba(255,255,255,0.12)", padding: "2px 8px", borderRadius: "6px", fontFamily: "monospace", fontWeight: 600, color: "#FFFFFF", fontSize: "0.8125rem" }}>
                      {order.awb_code}
                    </code>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <Badge
                variant={statusVariant(order.status)}
                style={{ fontSize: "0.875rem", padding: "0.4rem 0.875rem", fontFamily: "var(--font-subheading)", fontWeight: 600 }}
              >
                {statusLabel(order.status)}
              </Badge>

              {canTrack && (
                <a
                  href="https://www.shiprocket.in/shipment-tracking/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#FFFFFF", padding: "0.45rem 1rem",
                    borderRadius: "10px", fontFamily: "var(--font-subheading)", fontWeight: 600,
                    fontSize: "0.8125rem", textDecoration: "none",
                    transition: "background 0.2s ease",
                  }}
                >
                  <Truck size={14} /> Track Live Delivery
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Order Progress Timeline ── */}
        <div
          className="order-card section-card"
          style={{ ...sectionCardStyle, marginBottom: "1.5rem", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-primary)", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Truck size={18} color="var(--color-accent)" /> Order Progress
          </h2>
          <OrderStatusTimeline status={order.status} />
        </div>

        {/* ── 2×2 Detail Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* Items Ordered */}
          <div className="order-card section-card" style={{ ...sectionCardStyle, background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-primary)", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Package size={18} color="var(--color-accent)" />
              Items Ordered ({order.items.reduce((s, i) => s + (i.quantity || 1), 0)})
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
              {order.items.map((item, index) => (
                <li
                  key={index}
                  className="row-item"
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.875rem 0",
                    borderBottom: index === order.items.length - 1 ? "none" : "1px solid var(--color-border)",
                    gap: "1rem", transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "linear-gradient(135deg, #1F3A2E22, #2D524122)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <ShoppingBag size={16} color="var(--color-accent)" />
                    </div>
                    <div>
                      <span style={{ fontFamily: "var(--font-subheading)", fontWeight: 600, color: "var(--color-foreground)", fontSize: "0.9375rem", display: "block" }}>
                        {item.product_name}
                      </span>
                      <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-body)", color: "var(--color-muted)" }}>
                        Qty: {item.quantity} × {formatPrice(item.unit_price, order.currency)}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.9375rem", whiteSpace: "nowrap" }}>
                    {formatPrice(item.subtotal, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipment & Tracking */}
          <div className="order-card section-card" style={{ ...sectionCardStyle, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-primary)", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Truck size={18} color="var(--color-accent)" /> Shipment &amp; Tracking
            </h2>
            {hasShipment ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {order.courier_name && order.courier_name.trim().length > 0 && (
                  <div>
                    <span style={labelStyle}>Courier Partner</span>
                    <strong style={{ color: "var(--color-foreground)", fontSize: "0.9375rem", fontFamily: "var(--font-subheading)", fontWeight: 600 }}>
                      {order.courier_name}
                    </strong>
                  </div>
                )}
                <div>
                  <span style={labelStyle}>AWB / Tracking Number</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <code style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", padding: "4px 10px", borderRadius: "8px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.875rem" }}>
                      {order.awb_code}
                    </code>
                  </div>
                </div>
                <div>
                  <a
                    href="https://www.shiprocket.in/shipment-tracking/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8125rem", fontFamily: "var(--font-subheading)", fontWeight: 600, color: "var(--color-primary)", textDecoration: "underline" }}
                  >
                    Open Shiprocket Tracking <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "0.875rem", fontFamily: "var(--font-body)", color: "var(--color-muted)", lineHeight: 1.6 }}>
                Tracking information will be available once your package is dispatched by our courier partner.
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="order-card section-card" style={{ ...sectionCardStyle, background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-primary)", margin: "0 0 1rem" }}>
              Price Breakdown
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { label: "Subtotal", value: formatPrice(order.subtotal_amount, order.currency) },
                { label: "Shipping", value: order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount, order.currency) },
                { label: "GST (Taxes Included)", value: formatPrice(order.tax_amount, order.currency) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>{label}</span>
                  <span style={{ color: "var(--color-foreground)", fontFamily: "var(--font-subheading)", fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              {/* Total row */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingTop: "0.875rem", marginTop: "0.375rem",
                borderTop: "2px solid var(--color-border)",
              }}>
                <span style={{ fontFamily: "var(--font-subheading)", fontWeight: 600, fontSize: "1rem", color: "var(--color-primary)" }}>
                  Total Amount
                </span>
                <span style={{
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.375rem",
                  background: "linear-gradient(135deg, #1F3A2E, #3a7a58)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  {formatPrice(order.total_amount, order.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Destination */}
          <div className="order-card section-card" style={{ ...sectionCardStyle, background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-primary)", margin: "0 0 0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={18} color="var(--color-accent)" /> Shipping Destination
            </h2>
            {order.shipping_address ? (
              <address style={{ fontStyle: "normal", fontSize: "0.875rem", fontFamily: "var(--font-body)", color: "var(--color-muted)", lineHeight: 1.7 }}>
                {order.customer_name && (
                  <>
                    <strong style={{ color: "var(--color-foreground)", fontSize: "0.9375rem", fontFamily: "var(--font-subheading)", fontWeight: 600 }}>
                      {order.customer_name}
                    </strong>
                    <br />
                  </>
                )}
                {order.shipping_address.line1}<br />
                {order.shipping_address.line2 && <>{order.shipping_address.line2}<br /></>}
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </address>
            ) : (
              <p style={{ fontSize: "0.875rem", fontFamily: "var(--font-body)", color: "var(--color-muted)", margin: 0 }}>
                Standard Address Delivery
              </p>
            )}
            {order.customer_phone && (
              <div style={{
                marginTop: "0.75rem", paddingTop: "0.75rem",
                borderTop: "1px solid var(--color-border)",
                fontSize: "0.8125rem", fontFamily: "var(--font-body)", color: "var(--color-muted)",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}>
                <Phone size={13} color="var(--color-muted)" />
                <span>Contact: {order.customer_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="order-card"
          style={{
            marginTop: "1.5rem",
            padding: "1.25rem 1.5rem",
            borderRadius: "14px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: "1rem",
          }}
        >
          <a
            href="https://www.shiprocket.in/shipment-tracking/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.875rem", fontFamily: "var(--font-subheading)", fontWeight: 600,
              color: "var(--color-accent)", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
            }}
          >
            Track on Shiprocket →
          </a>
          <p style={{ margin: 0, fontSize: "0.8125rem", fontFamily: "var(--font-body)", color: "var(--color-muted)" }}>
            Need assistance?{" "}
            <Link href="/contact" style={{ color: "var(--color-primary)", fontFamily: "var(--font-subheading)", fontWeight: 600, textDecoration: "underline" }}>
              Contact FarmSmith Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
