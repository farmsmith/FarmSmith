"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import {
  Truck,
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  Package,
  Phone,
} from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import {
  ErrorState,
  OfflineState,
  PermissionDeniedState,
  SessionExpiredState,
  LoadingState,
} from "@/components/ui/states";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import type { Order, OrderItem } from "@/types/order";

interface OrderDetail extends Order {
  items: OrderItem[];
  tracking_token: string;
}

function statusVariant(status: Order["status"]): "success" | "warning" | "error" | "muted" | "default" {
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

function statusLabel(status: Order["status"]): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccountOrderDetailPage() {
  const { isOnline } = useNetworkStatus();
  const params = useParams<{ orderNumber: string }>();
  const { orderNumber } = params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    setSessionExpired(false);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setSessionExpired(true);
        return;
      }
      const res = await fetch(`/api/account/orders/${orderNumber}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (res.status === 403) {
        setPermissionDenied(true);
        return;
      }
      if (res.status === 404) {
        setError("Order not found or no longer available.");
        return;
      }
      if (!res.ok) {
        setError("We couldn't load details for this order. Please try again.");
        return;
      }
      const data = (await res.json()) as OrderDetail;
      setOrder(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          boxShadow: "var(--shadow-card)",
          fontFamily: "var(--font-body)",
        }}
      >
        <LoadingState
          layout="section"
          title="Loading order details..."
          description={`Fetching information for order #${orderNumber}...`}
          className="py-12"
        />
      </div>
    );
  }

  if (sessionExpired || permissionDenied || error || !order) {
    return (
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          fontFamily: "var(--font-body)",
        }}
      >
        {sessionExpired ? (
          <SessionExpiredState
            layout="card"
            redirectUrl={`/account/orders/${orderNumber}`}
            className="py-6"
          />
        ) : permissionDenied ? (
          <PermissionDeniedState
            layout="card"
            title="Order Access Restricted"
            description="You do not have permission to view details for this order."
            primaryAction={{
              label: "Back to Orders",
              href: "/account/orders",
            }}
            secondaryAction={{
              label: "Go Home",
              href: "/",
              variant: "outline",
            }}
            className="py-6"
          />
        ) : error && !isOnline ? (
          <OfflineState
            layout="card"
            title="You're offline"
            description="We couldn't load this order's details because your device lost internet connection."
            primaryAction={{
              label: "Try Again",
              onClick: () => void fetchOrder(),
            }}
            secondaryAction={{
              label: "Back to Orders",
              href: "/account/orders",
            }}
            className="py-6"
          />
        ) : (
          <ErrorState
            layout="card"
            title="Could not load order"
            description={error ?? "We were unable to retrieve details for this order."}
            primaryAction={{
              label: "Try Again",
              onClick: () => void fetchOrder(),
            }}
            secondaryAction={{
              label: "Back to Orders",
              href: "/account/orders",
            }}
            className="py-6"
          />
        )}
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
        width: "100%",
        fontFamily: "var(--font-body)",
        fontWeight: 400,
      }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .order-detail-card { animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .order-detail-card:nth-child(1) { animation-delay: 0.04s; }
        .order-detail-card:nth-child(2) { animation-delay: 0.1s; }
        .order-detail-card:nth-child(3) { animation-delay: 0.16s; }
        .detail-section-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .detail-section-card:hover {
          box-shadow: 0 8px 24px rgba(31,58,46,0.07) !important;
          border-color: rgba(31,58,46,0.22) !important;
        }
        .item-row-luxury:hover {
          background: rgba(31,58,46,0.03);
          border-radius: 8px;
          margin-inline: -0.5rem;
          padding-inline: 0.5rem;
        }
      `}</style>

      {/* 1. Back Navigation */}
      <div style={{ marginBottom: "1.25rem" }} className="order-detail-card">
        <Link
          href="/account/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.875rem",
            fontFamily: "var(--font-subheading)",
            fontWeight: 600,
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
        >
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      {/* 2. Luxury Hero Order Header */}
      <div
        className="order-detail-card"
        style={{
          background: "linear-gradient(135deg, #1F3A2E 0%, #2A4D3A 60%, #173125 100%)",
          borderRadius: "20px",
          padding: "clamp(1.5rem, 4vw, 2.25rem)",
          marginBottom: "1.5rem",
          boxShadow: "0 8px 36px rgba(31,58,46,0.28)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative glow shapes */}
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-50px", left: "25%", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.25rem",
            position: "relative",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.375rem, 3.2vw, 1.875rem)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  margin: 0,
                  letterSpacing: "0.01em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>ORDER</span>
                <code
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    padding: "3px 12px",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    fontSize: "clamp(1.05rem, 2.4vw, 1.35rem)",
                    letterSpacing: "0.03em",
                  }}
                >
                  #{order.order_number}
                </code>
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                flexWrap: "wrap",
                marginTop: "0.6rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.75)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <Calendar size={14} />
                Placed on {formattedDate}
              </p>

              {order.tracking_token && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.8125rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  <span>Tracking Key:</span>
                  <code
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {order.tracking_token}
                  </code>
                  <CopyButton text={order.tracking_token} label="Copy Tracking Key" />
                </div>
              )}

              {order.awb_code && order.awb_code.trim().length > 0 && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.8125rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  <span>AWB No:</span>
                  <code
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {order.awb_code}
                  </code>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <Badge
              variant={statusVariant(order.status)}
              style={{
                fontSize: "0.875rem",
                padding: "0.45rem 0.95rem",
                fontFamily: "var(--font-subheading)",
                fontWeight: 600,
                borderRadius: "999px",
              }}
            >
              {statusLabel(order.status)}
            </Badge>

            {canTrack && (
              <a
                href="https://www.shiprocket.in/shipment-tracking/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "#FFFFFF",
                  padding: "0.45rem 1.05rem",
                  borderRadius: "10px",
                  fontFamily: "var(--font-subheading)",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  transition: "background 0.2s ease",
                }}
              >
                <Truck size={14} /> Track Live Delivery
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Order Progress Timeline */}
      <div
        className="order-detail-card detail-section-card"
        style={{
          marginBottom: "1.75rem",
          padding: "1.5rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.0625rem",
            fontWeight: 600,
            color: "var(--color-primary)",
            margin: "0 0 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Truck size={18} color="var(--color-accent)" /> Order Progress
        </h2>
        <OrderStatusTimeline status={order.status} />
      </div>

      {/* 4. Main Details Grid */}
      <div
        className="order-detail-card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
          marginBottom: "1.75rem",
        }}
      >
        {/* Row 1, Col 1: Items Ordered */}
        <div
          className="detail-section-card"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "1.5rem",
            background: "var(--color-card)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              margin: "0 0 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Package size={18} color="var(--color-accent)" />
            Items Ordered ({order.items.reduce((s, i) => s + (i.quantity || 1), 0)})
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
            {order.items.map((item, index) => (
              <li
                key={item.id || index}
                className="item-row-luxury"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.875rem 0",
                  borderBottom:
                    index === order.items.length - 1 ? "none" : "1px solid var(--color-border)",
                  gap: "1rem",
                  transition: "all 0.15s ease",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-subheading)",
                      fontWeight: 600,
                      color: "var(--color-foreground)",
                      fontSize: "0.9375rem",
                      display: "block",
                    }}
                  >
                    {item.product_name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      color: "var(--color-muted)",
                    }}
                  >
                    Qty: {item.quantity} × {formatPrice(item.unit_price, order.currency)}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-subheading)",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    fontSize: "0.9375rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatPrice(item.subtotal, order.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Row 1, Col 2: Shipment & Tracking */}
        <div
          className="detail-section-card"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "1.5rem",
            background: "var(--color-surface)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              margin: "0 0 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Truck size={18} color="var(--color-accent)" />
            Shipment & Tracking
          </h2>

          {hasShipment ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {order.courier_name && order.courier_name.trim().length > 0 && (
                <div style={{ fontSize: "0.875rem" }}>
                  <span
                    style={{
                      color: "var(--color-muted)",
                      display: "block",
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.15rem",
                    }}
                  >
                    Courier Partner
                  </span>
                  <strong
                    style={{
                      color: "var(--color-foreground)",
                      fontSize: "0.9375rem",
                      fontFamily: "var(--font-subheading)",
                      fontWeight: 600,
                    }}
                  >
                    {order.courier_name}
                  </strong>
                </div>
              )}

              <div style={{ fontSize: "0.875rem" }}>
                <span
                  style={{
                    color: "var(--color-muted)",
                    display: "block",
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.25rem",
                  }}
                >
                  AWB / Tracking Number
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <code
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {order.awb_code}
                  </code>
                </div>
              </div>

              <div style={{ marginTop: "0.25rem" }}>
                <a
                  href="https://www.shiprocket.in/shipment-tracking/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.8125rem",
                    fontFamily: "var(--font-subheading)",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    textDecoration: "underline",
                  }}
                >
                  Open Shiprocket Tracking <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                color: "var(--color-muted)",
                lineHeight: 1.6,
              }}
            >
              Tracking information will be available once your package is dispatched by our courier partner.
            </p>
          )}
        </div>

        {/* Row 2, Col 1: Price Breakdown */}
        <div
          className="detail-section-card"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "1.5rem",
            background: "var(--color-card)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              margin: "0 0 1rem",
            }}
          >
            Price Breakdown
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span
                style={{
                  color: "var(--color-muted)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  color: "var(--color-foreground)",
                  fontFamily: "var(--font-subheading)",
                  fontWeight: 500,
                }}
              >
                {formatPrice(order.subtotal_amount, order.currency)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span
                style={{
                  color: "var(--color-muted)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                }}
              >
                Shipping
              </span>
              <span
                style={{
                  color: "var(--color-foreground)",
                  fontFamily: "var(--font-subheading)",
                  fontWeight: 500,
                }}
              >
                {order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount, order.currency)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span
                style={{
                  color: "var(--color-muted)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                }}
              >
                GST (Taxes Included)
              </span>
              <span
                style={{
                  color: "var(--color-foreground)",
                  fontFamily: "var(--font-subheading)",
                  fontWeight: 500,
                }}
              >
                {formatPrice(order.tax_amount, order.currency)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "0.875rem",
                marginTop: "0.375rem",
                borderTop: "2px solid var(--color-border)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-subheading)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "var(--color-primary)",
                }}
              >
                Total Amount
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "1.375rem",
                  color: "var(--color-primary)",
                }}
              >
                {formatPrice(order.total_amount, order.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2, Col 2: Shipping Destination */}
        <div
          className="detail-section-card"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "1.5rem",
            background: "var(--color-card)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              margin: "0 0 0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <MapPin size={18} color="var(--color-accent)" />
            Shipping Destination
          </h2>

          <address
            style={{
              fontStyle: "normal",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              color: "var(--color-muted)",
              lineHeight: 1.6,
            }}
          >
            <strong
              style={{
                color: "var(--color-foreground)",
                fontSize: "0.9375rem",
                fontFamily: "var(--font-subheading)",
                fontWeight: 600,
              }}
            >
              {order.customer_name}
            </strong>
            <br />
            {order.shipping_address.line1}
            <br />
            {order.shipping_address.line2 && (
              <>
                {order.shipping_address.line2}
                <br />
              </>
            )}
            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
          </address>

          {order.customer_phone && (
            <div
              style={{
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--color-border)",
                fontSize: "0.8125rem",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                color: "var(--color-muted)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Phone size={13} color="var(--color-muted)" />
              <span>Contact: {order.customer_phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Footer Links & Actions */}
      <div
        style={{
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <a
          href="https://www.shiprocket.in/shipment-tracking/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.875rem",
            fontFamily: "var(--font-subheading)",
            fontWeight: 500,
            color: "var(--color-accent)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          View Public Tracking Page →
        </a>

        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            color: "var(--color-muted)",
          }}
        >
          Need assistance?{" "}
          <Link
            href="/contact"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-subheading)",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Contact FarmSmith Support
          </Link>
        </p>
      </div>
    </div>
  );
}
