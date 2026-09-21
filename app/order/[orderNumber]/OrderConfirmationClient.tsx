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

export default function OrderConfirmationClient() {
  const { isOnline } = useNetworkStatus();
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const trackingToken = searchParams.get("token") ?? "";
  const { orderNumber } = params;

  const [order, setOrder] = useState<PublicOrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(
    async (isRefresh = false) => {
      if (!trackingToken) {
        setError("Missing tracking token. Please check your confirmation email.");
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
          body: JSON.stringify({
            orderNumber,
            trackingToken,
          }),
        });

        if (res.status === 404) {
          setError("Order not found. Please verify your order number and tracking key.");
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
    [orderNumber, trackingToken]
  );

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div
        style={{
          background: "var(--color-background)",
          minHeight: "80vh",
          paddingBlock: "3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-body)",
        }}
      >
        <div className="container" style={{ maxWidth: "860px" }}>
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(1.5rem, 4vw, 2.5rem)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <LoadingState
              layout="section"
              title="Loading order details..."
              description={`Fetching information for order #${orderNumber}...`}
              className="py-12"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        style={{
          background: "var(--color-background)",
          minHeight: "80vh",
          paddingBlock: "3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-body)",
        }}
      >
        <div className="container" style={{ maxWidth: "560px" }}>
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {error && !isOnline ? (
              <OfflineState
                layout="card"
                title="You're offline"
                description="We couldn't retrieve this order because your device is not connected to the internet."
                primaryAction={{
                  label: "Try Again",
                  onClick: () => void fetchOrder(true),
                }}
                secondaryAction={{
                  label: "Track an Order",
                  href: "/track",
                }}
                className="py-6"
              />
            ) : (
              <ErrorState
                layout="card"
                title="Could not load order"
                description={
                  error ??
                  "We couldn't retrieve this order. Please verify your order number and tracking key."
                }
                primaryAction={{
                  label: "Try Again",
                  onClick: () => void fetchOrder(true),
                }}
                secondaryAction={{
                  label: "Back to Track",
                  href: "/track",
                }}
                className="py-6"
              />
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

  return (
    <div
      style={{
        background: "var(--color-background)",
        minHeight: "80vh",
        paddingBlock: "3rem",
        fontFamily: "var(--font-body)",
        fontWeight: 400,
      }}
    >
      <div className="container" style={{ maxWidth: "920px" }}>
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(1.5rem, 4vw, 2.5rem)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* 1. Back Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <Link
              href="/track"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.875rem",
                fontFamily: "var(--font-subheading)",
                fontWeight: 500,
                color: "var(--color-muted)",
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}
            >
              <ArrowLeft size={16} /> Back to Track Order
            </Link>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => fetchOrder(true)}
              aria-label="Refresh order status"
              loading={refreshing}
              title="Refresh order status"
            >
              <RefreshCw size={14} aria-hidden="true" />
            </Button>
          </div>

          {/* 2. Order Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1.25rem",
              paddingBottom: "1.75rem",
              borderBottom: "1px solid var(--color-border)",
              marginBottom: "2rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.375rem, 3vw, 1.75rem)",
                    fontWeight: 600,
                    color: "var(--color-primary)",
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
                      background: "rgba(0,0,0,0.05)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                      fontSize: "clamp(1.05rem, 2.2vw, 1.25rem)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    #{order.order_number}
                  </code>
                </h1>
                <CopyButton text={order.order_number} label="Copy Order ID" />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  flexWrap: "wrap",
                  marginTop: "0.4rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    color: "var(--color-muted)",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <Calendar size={14} color="var(--color-muted)" />
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
                      color: "var(--color-muted)",
                    }}
                  >
                    <span>Tracking Key:</span>
                    <code
                      style={{
                        background: "rgba(0,0,0,0.05)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "var(--color-primary)",
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
                      color: "var(--color-muted)",
                    }}
                  >
                    <span>AWB No:</span>
                    <code
                      style={{
                        background: "rgba(0,0,0,0.05)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "var(--color-primary)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {order.awb_code}
                    </code>
                    <CopyButton text={order.awb_code} label="Copy AWB" />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <Badge
                variant={statusVariant(order.status)}
                style={{
                  fontSize: "0.875rem",
                  padding: "0.4rem 0.875rem",
                  fontFamily: "var(--font-subheading)",
                  fontWeight: 500,
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
                    gap: "0.4rem",
                    background: "linear-gradient(135deg, #1F3A2E 0%, #2D5241 100%)",
                    color: "#FFFFFF",
                    padding: "0.45rem 1rem",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-subheading)",
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                    boxShadow: "0 2px 6px rgba(31,58,46,0.18)",
                  }}
                >
                  <Truck size={14} /> Track Live Delivery
                </a>
              )}
            </div>
          </div>

          {/* 3. Order Progress Timeline */}
          <div
            style={{
              marginBottom: "2.5rem",
              padding: "1.5rem",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                margin: "0 0 1.25rem",
              }}
            >
              Order Progress
            </h2>
            <OrderStatusTimeline status={order.status} />
          </div>

          {/* 4. Main Details Grid (2 columns: Row 1 = Items & Shipment; Row 2 = Price Breakdown & Shipping Destination) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.75rem",
              alignItems: "start",
              marginBottom: "2rem",
            }}
          >
            {/* Row 1, Col 1: Items Ordered */}
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                background: "var(--color-card)",
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
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.875rem 0",
                      borderBottom:
                        index === order.items.length - 1 ? "none" : "1px solid var(--color-border)",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "var(--font-subheading)",
                          fontWeight: 500,
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
                        fontWeight: 500,
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
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                background: "var(--color-surface)",
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
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {order.courier_name && order.courier_name.trim().length > 0 && (
                    <div style={{ fontSize: "0.875rem" }}>
                      <span
                        style={{
                          color: "var(--color-muted)",
                          display: "block",
                          fontSize: "0.75rem",
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                        }}
                      >
                        Courier Partner
                      </span>
                      <strong
                        style={{
                          color: "var(--color-foreground)",
                          fontSize: "0.9375rem",
                          fontFamily: "var(--font-subheading)",
                          fontWeight: 500,
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
                        fontWeight: 400,
                        marginBottom: "0.2rem",
                      }}
                    >
                      AWB / Tracking Number
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <code
                        style={{
                          background: "rgba(0,0,0,0.06)",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                          fontSize: "0.875rem",
                        }}
                      >
                        {order.awb_code}
                      </code>
                      <CopyButton text={order.awb_code || ""} label="Copy AWB" />
                    </div>
                  </div>

                  <div style={{ marginTop: "0.5rem" }}>
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
                        fontWeight: 500,
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
                    lineHeight: 1.5,
                  }}
                >
                  Tracking information will be available once your package is dispatched by our courier partner.
                </p>
              )}
            </div>

            {/* Row 2, Col 1: Price Breakdown */}
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                background: "var(--color-card)",
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
                      fontWeight: 500,
                      fontSize: "1rem",
                      color: "var(--color-primary)",
                    }}
                  >
                    Total Amount
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: "1.25rem",
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
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                background: "var(--color-card)",
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

              {order.shipping_address ? (
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
                  {order.customer_name && (
                    <>
                      <strong
                        style={{
                          color: "var(--color-foreground)",
                          fontSize: "0.9375rem",
                          fontFamily: "var(--font-subheading)",
                          fontWeight: 500,
                        }}
                      >
                        {order.customer_name}
                      </strong>
                      <br />
                    </>
                  )}
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
              ) : (
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    color: "var(--color-muted)",
                    margin: 0,
                  }}
                >
                  Standard Address Delivery
                </p>
              )}

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
              Track on Shiprocket →
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
      </div>
    </div>
  );
}
