"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Package } from "lucide-react";
import type { Order } from "@/types/order";

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

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch("/api/account/orders", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          setError("Failed to load orders.");
        }
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "var(--radius-lg)" }} />
        ))}
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
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.375rem",
          color: "var(--color-primary)",
          marginBottom: "1.75rem",
        }}
      >
        My Orders
      </h1>

      {error && (
        <div role="alert" style={{ color: "var(--color-error)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <Package size={48} style={{ color: "var(--color-muted)", opacity: 0.4, margin: "0 auto 1rem" }} aria-hidden="true" />
          <p style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.125rem", marginBottom: "0.5rem" }}>
            No orders yet
          </p>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
            When you place your first order, it will appear here.
          </p>
          <Link
            href="/shop"
            style={{
              display: "inline-block",
              marginTop: "1.25rem",
              background: "var(--color-primary)",
              color: "var(--color-card)",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            Shop Now
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => (
            <li
              key={order.id}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
                    {order.order_number}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                    {new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Badge variant={statusVariant(order.status)}>
                    {statusLabel(order.status)}
                  </Badge>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-primary)" }}>
                    {formatPrice(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  {order.tracking_token && (
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)", marginRight: "1rem" }}>
                      Tracking ID: <code style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "var(--color-primary)" }}>{order.tracking_token.substring(0, 16)}...</code>
                    </span>
                  )}
                  <Link
                    href={`/account/orders/${order.order_number}`}
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-accent)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View Details →
                  </Link>
                </div>
                {order.tracking_token && (
                  <Link
                    href={`/order/${order.order_number}?token=${order.tracking_token}`}
                    style={{
                      fontSize: "0.8125rem",
                      background: "var(--color-primary)",
                      color: "#fff",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Track Order 🚚
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
