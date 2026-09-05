"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Package } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState, ErrorState, OfflineState, PermissionDeniedState, SessionExpiredState } from "@/components/ui/states";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";


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
  const { isOnline } = useNetworkStatus();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    setSessionExpired(false);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSessionExpired(true);
        return;
      }
      const res = await fetch("/api/account/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.status === 401) {
        setSessionExpired(true);
      } else if (res.status === 403) {
        setPermissionDenied(true);
      } else if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setError("We couldn't load your order history. Please try again.");
      }
    } catch {
      setError("Network error while loading orders. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <span className="sr-only">Loading your orders...</span>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: "110px", borderRadius: "var(--radius-lg)" }}
            aria-hidden="true"
          />
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

      {sessionExpired ? (
        <SessionExpiredState
          layout="card"
          redirectUrl="/account/orders"
          className="py-8"
        />
      ) : permissionDenied ? (
        <PermissionDeniedState
          layout="card"
          title="Orders Access Restricted"
          description="You do not have permission to view this order history."
          primaryAction={{
            label: "Go to Account",
            href: "/account",
          }}
          secondaryAction={{
            label: "Shop Now",
            href: "/shop",
            variant: "outline",
          }}
          className="py-8"
        />
      ) : error && !isOnline ? (
        <OfflineState
          layout="card"
          title="You're offline"
          description="We couldn't load your orders because you lost connection. Reconnect and try again."
          primaryAction={{
            label: "Try Again",
            onClick: () => void fetchOrders(),
          }}
          className="py-8"
        />
      ) : error ? (
        <ErrorState
          layout="card"
          title="Could not load orders"
          description={error}
          primaryAction={{
            label: "Try Again",
            onClick: () => void fetchOrders(),
          }}
          className="py-8"
        />
      ) : null}

      {!sessionExpired && !permissionDenied && !error && orders.length === 0 && (


        <EmptyState
          layout="card"
          icon={<Package size={36} aria-hidden="true" />}
          title="No orders yet"
          description="When you place your first order, it will appear here."
          primaryAction={{
            label: "Shop Now",
            href: "/shop",
          }}
          className="py-12"
        />
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  {order.tracking_token && (
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      Tracking Key: <code style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "var(--color-primary)" }}>{order.tracking_token.substring(0, 16)}...</code>
                      <CopyButton text={order.tracking_token} label="Copy Key" />
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
