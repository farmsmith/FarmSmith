"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, RefreshCw, Truck, ExternalLink } from "lucide-react";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import { formatPrice } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import type { PublicOrderStatus } from "@/types/order";

export default function OrderConfirmationClient() {
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
          body: JSON.stringify({ orderNumber, trackingToken }),
        });

        if (res.status === 404) {
          setError("Order not found. Please check your order number and tracking token.");
          return;
        }
        if (!res.ok) {
          setError("Unable to load order status. Please try again.");
          return;
        }
        const data = (await res.json()) as PublicOrderStatus;
        setOrder(data);
      } catch {
        setError("Network error. Please check your connection.");
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
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="skeleton"
            style={{ width: "200px", height: "1.5rem", margin: "0 auto 1rem" }}
          />
          <div
            className="skeleton"
            style={{ width: "300px", height: "1rem", margin: "0 auto" }}
          />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-primary)",
            fontSize: "1.75rem",
          }}
        >
          Order not found
        </h1>
        <p style={{ color: "var(--color-muted)", maxWidth: "400px" }}>
          {error ?? "We couldn't find this order."}
        </p>
        <Link
          href="/track"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-card)",
            padding: "0.875rem 2rem",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Track an Order
        </Link>
      </div>
    );
  }

  const isPaid =
    order.status === "paid" ||
    order.status === "processing" ||
    order.status === "shipped" ||
    order.status === "delivered";

  return (
    <div
      style={{
        background: "var(--color-background)",
        minHeight: "80vh",
        paddingBlock: "3rem",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              background: isPaid ? "#F0FDF4" : "var(--color-card)",
              border: `1px solid ${isPaid ? "#86EFAC" : "var(--color-border)"}`,
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            {isPaid && (
              <CheckCircle
                size={48}
                style={{ color: "#22C55E", margin: "0 auto 1rem" }}
                aria-hidden="true"
              />
            )}
            <p
              className="eyebrow"
              style={{ marginBottom: "0.5rem", color: "var(--color-accent)" }}
            >
              {isPaid ? "Payment Confirmed" : "Order Placed"}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                color: "var(--color-primary)",
                marginBottom: "0.5rem",
              }}
            >
              {isPaid ? "Thank you for your order!" : "Order received"}
            </h1>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9375rem", marginBottom: "0.75rem" }}>
              Order{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                {order.order_number}
              </strong>
            </p>
            {order.tracking_token && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  background: "rgba(22, 101, 52, 0.08)",
                  border: "1px solid rgba(22, 101, 52, 0.2)",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  color: "var(--color-primary)",
                  fontWeight: 500,
                  marginTop: "0.5rem",
                }}
              >
                🔑 <strong>Tracking Access Key:</strong> <code>{order.tracking_token}</code>
              </div>
            )}
          </div>

          {/* Shipment Details & External Tracking (only shown if awb_code exists and is non-empty) */}
          {order.awb_code && order.awb_code.trim().length > 0 && (
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "1.5rem 2rem",
                marginBottom: "2rem",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.125rem",
                      color: "var(--color-primary)",
                      marginBottom: "0.625rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Truck size={20} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
                    Shipment Details
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {order.courier_name && order.courier_name.trim().length > 0 && (
                      <p style={{ margin: 0, color: "var(--color-foreground)" }}>
                        <span style={{ color: "var(--color-muted)" }}>Courier:</span>{" "}
                        <strong>{order.courier_name}</strong>
                      </p>
                    )}
                    <p style={{ margin: 0, color: "var(--color-foreground)" }}>
                      <span style={{ color: "var(--color-muted)" }}>AWB:</span>{" "}
                      <code
                        style={{
                          background: "rgba(0,0,0,0.05)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                          fontSize: "0.875rem",
                        }}
                      >
                        {order.awb_code}
                      </code>
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.shiprocket.in/shipment-tracking/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "var(--color-primary)",
                    color: "#ffffff",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    transition: "opacity 0.15s ease",
                  }}
                  id="shiprocket-external-tracking-link"
                >
                  Track Detailed Shipment ↗
                </a>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.5rem",
            }}
            className="md:grid-cols-2"
          >
            {/* Status timeline */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.125rem",
                    color: "var(--color-primary)",
                  }}
                >
                  Order Status
                </h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => fetchOrder(true)}
                  aria-label="Refresh order status"
                  loading={refreshing}
                >
                  <RefreshCw size={14} aria-hidden="true" />
                </Button>
              </div>
              <OrderStatusTimeline status={order.status} />
            </div>

            {/* Order details */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
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
                Order Details
              </h2>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                {order.items.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--color-foreground)" }}>
                      {item.product_name}{" "}
                      <span style={{ color: "var(--color-muted)" }}>
                        × {item.quantity}
                      </span>
                    </span>
                    <span
                      style={{ color: "var(--color-primary)", fontWeight: 600 }}
                    >
                      {formatPrice(item.subtotal, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>

              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-muted)" }}>Subtotal</span>
                  <span>{formatPrice(order.subtotal_amount ?? 0, order.currency)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-muted)" }}>Shipping</span>
                  <span style={{ color: order.shipping_amount === 0 ? "var(--color-accent)" : "inherit", fontWeight: order.shipping_amount === 0 ? 600 : 400 }}>
                    {order.shipping_amount === 0 ? "FREE" : formatPrice(order.shipping_amount ?? 0, order.currency)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-muted)" }}>GST (5% Incl.)</span>
                  <span>{formatPrice(order.tax_amount ?? 0, order.currency)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--color-primary)",
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatPrice(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            <Link
              href="/shop"
              style={{
                border: "1.5px solid var(--color-primary)",
                color: "var(--color-primary)",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
