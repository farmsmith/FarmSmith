"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Truck, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import type { Order, OrderItem } from "@/types/order";

interface OrderDetail extends Order {
  items: OrderItem[];
  tracking_token: string;
}

function statusVariant(status: Order["status"]): "success" | "warning" | "error" | "muted" | "default" {
  switch (status) {
    case "paid": case "processing": case "shipped": case "delivered": return "success";
    case "pending_payment": return "warning";
    case "cancelled": case "refunded": return "error";
    default: return "muted";
  }
}

function statusLabel(status: Order["status"]): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccountOrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const { orderNumber } = params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`/api/account/orders/${orderNumber}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 404) { setError("Order not found."); return; }
        if (!res.ok) { setError("Failed to load order."); return; }
        const data = await res.json() as OrderDetail;
        setOrder(data);
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    };
    void fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "var(--radius-md)" }} />
        ))}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--color-error)", marginBottom: "1rem" }}>{error ?? "Order not found."}</p>
        <Link href="/account/orders" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "2rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Back */}
      <Link href="/account/orders" style={{ fontSize: "0.875rem", color: "var(--color-muted)", textDecoration: "none", display: "block", marginBottom: "1.5rem" }}>
        ← Back to Orders
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.375rem", color: "var(--color-primary)", marginBottom: "0.25rem" }}>
            {order.order_number}
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
            Placed {new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Badge variant={statusVariant(order.status)} style={{ fontSize: "0.8125rem" }}>
          {statusLabel(order.status)}
        </Badge>
      </div>

      {/* Shipment Details & External Tracking (only shown if awb_code exists and is non-empty) */}
      {order.awb_code && order.awb_code.trim().length > 0 && (
        <div
          style={{
            background: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1rem",
                  color: "var(--color-primary)",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Truck size={18} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
                Shipment Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem" }}>
                {order.courier_name && order.courier_name.trim().length > 0 && (
                  <p style={{ margin: 0, color: "var(--color-foreground)" }}>
                    <span style={{ color: "var(--color-muted)" }}>Courier:</span>{" "}
                    <strong>{order.courier_name}</strong>
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                      }}
                    >
                      {order.awb_code}
                    </code>
                  </p>
                  <CopyButton text={order.awb_code} label="Copy AWB" />
                </div>
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
                padding: "0.625rem 1rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Track Detailed Shipment ↗
            </a>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--color-border)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Order Progress</h2>
        <OrderStatusTimeline status={order.status} />
      </div>

      {/* Items */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Items Ordered</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {order.items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.875rem",
                padding: "0.625rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span style={{ color: "var(--color-foreground)" }}>
                {item.product_name}
                <span style={{ color: "var(--color-muted)", marginLeft: "0.5rem" }}>× {item.quantity}</span>
              </span>
              <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                {formatPrice(item.subtotal, order.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {[
          { label: "Subtotal", value: order.subtotal_amount },
          { label: "Shipping", value: order.shipping_amount },
          { label: "Tax (GST)", value: order.tax_amount },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--color-muted)" }}>{label}</span>
            <span style={{ color: "var(--color-foreground)" }}>
              {value === 0 && label === "Shipping" ? "Free" : formatPrice(value, order.currency)}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "2px solid var(--color-border)" }}>
          <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>Total</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-primary)" }}>
            {formatPrice(order.total_amount, order.currency)}
          </span>
        </div>
      </div>

      {/* Shipping address */}
      <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>Shipping To</h2>
        <address style={{ fontStyle: "normal", fontSize: "0.875rem", color: "var(--color-muted)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--color-foreground)" }}>{order.customer_name}</strong><br />
          {order.shipping_address.line1}<br />
          {order.shipping_address.line2 && <>{order.shipping_address.line2}<br /></>}
          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
        </address>
      </div>

      {/* Guest tracking link */}
      <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
        <Link
          href={`/order/${order.order_number}?token=${order.tracking_token}`}
          style={{ fontSize: "0.875rem", color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}
        >
          View public tracking page →
        </Link>
      </div>
    </div>
  );
}
