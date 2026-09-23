"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Badge } from "@/components/ui/Badge";
import {
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  ErrorState,
  OfflineState,
  PermissionDeniedState,
  SessionExpiredState,
  LoadingState,
} from "@/components/ui/states";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import type { Order } from "@/types/order";

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

export default function OrdersClient() {
  const { isOnline } = useNetworkStatus();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    setSessionExpired(false);
    setPage(1);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setSessionExpired(true);
        return;
      }
      const res = await fetch("/api/account/orders?page=1&limit=20", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.status === 401) {
        setSessionExpired(true);
      } else if (res.status === 403) {
        setPermissionDenied(true);
      } else if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
        setHasMore(data.length === 20);
      } else {
        setError("We couldn't load your order history. Please try again.");
      }
    } catch {
      setError("Network error while loading orders. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreOrders = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setSessionExpired(true);
        return;
      }
      const nextPage = page + 1;
      const res = await fetch(`/api/account/orders?page=${nextPage}&limit=20`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === 20);
      }
    } catch {
      // Keep existing orders if page request fails
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function initialLoad() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (ignore) return;
        if (!session) {
          setSessionExpired(true);
          setLoading(false);
          return;
        }
        const res = await fetch("/api/account/orders?page=1&limit=20", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (ignore) return;
        if (res.status === 401) {
          setSessionExpired(true);
        } else if (res.status === 403) {
          setPermissionDenied(true);
        } else if (res.ok) {
          const data: Order[] = await res.json();
          setOrders(data);
          setHasMore(data.length === 20);
          setError(null);
        } else {
          setError("We couldn't load your order history. Please try again.");
        }
      } catch {
        if (!ignore) {
          setError("Network error while loading orders. Please check your connection.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void initialLoad();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div style={{ width: "100%", fontFamily: "var(--font-body)" }}>
      {/* Main Container Card */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Header Title Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.75rem",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.5rem, 3.5vw, 1.875rem)",
                fontWeight: 600,
                color: "var(--color-primary)",
                margin: "0 0 0.25rem",
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
              }}
            >
              My Orders
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                color: "var(--color-muted)",
              }}
            >
              View past purchases, tracking numbers, and real-time shipment statuses
            </p>
          </div>

          {orders.length > 0 && (
            <Link
              href="/#featured-harvest"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.8125rem",
                fontFamily: "var(--font-subheading)",
                fontWeight: 500,
                color: "var(--color-accent)",
                textDecoration: "none",
              }}
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: "3rem 1rem" }}>
            <LoadingState
              layout="section"
              title="Loading your orders..."
              description="Retrieving your purchase history and tracking details from FarmSmith."
            />
          </div>
        )}

        {/* Auth / Error States */}
        {!loading && sessionExpired && (
          <SessionExpiredState
            layout="section"
            redirectUrl="/account/orders"
            className="py-6"
          />
        )}

        {!loading && !sessionExpired && permissionDenied && (
          <PermissionDeniedState
            layout="section"
            title="Orders Access Restricted"
            description="You do not have permission to view this order history."
            primaryAction={{
              label: "Go to Account",
              href: "/account",
            }}
            secondaryAction={{
              label: "Shop Now",
              href: "/#featured-harvest",
              variant: "outline",
            }}
            className="py-6"
          />
        )}

        {!loading && !sessionExpired && !permissionDenied && error && !isOnline && (
          <OfflineState
            layout="section"
            title="You're offline"
            description="We couldn't load your orders because your connection was lost. Reconnect and try again."
            primaryAction={{
              label: "Try Again",
              onClick: () => void fetchOrders(),
            }}
            className="py-6"
          />
        )}

        {!loading && !sessionExpired && !permissionDenied && error && isOnline && (
          <ErrorState
            layout="section"
            title="Could not load orders"
            description={error}
            primaryAction={{
              label: "Try Again",
              onClick: () => void fetchOrders(),
            }}
            className="py-6"
          />
        )}

        {/* Empty State */}
        {!loading && !sessionExpired && !permissionDenied && !error && orders.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "clamp(2.5rem, 6vw, 4rem) 1rem 2rem",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(31, 58, 46, 0.08) 0%, rgba(196, 136, 62, 0.15) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
                boxShadow: "0 0 0 8px rgba(31, 58, 46, 0.03)",
              }}
            >
              <Package size={36} color="var(--color-primary)" strokeWidth={1.75} />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  background: "var(--color-accent)",
                  borderRadius: "50%",
                  width: "26px",
                  height: "26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <Sparkles size={14} />
              </div>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.375rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                margin: "0 0 1.5rem",
              }}
            >
              No orders placed yet
            </h2>

            <Link
              href="/#featured-harvest"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "linear-gradient(135deg, #1F3A2E 0%, #2D5241 100%)",
                color: "#FFFFFF",
                padding: "0.8125rem 1.75rem",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-subheading)",
                fontWeight: 500,
                fontSize: "0.9375rem",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(31, 58, 46, 0.25)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
            >
              <ShoppingBag size={17} />
              Explore FarmSmith Products
            </Link>
          </div>
        )}

        {/* Active Orders List */}
        {!loading && !sessionExpired && !permissionDenied && !error && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const canTrack =
                order.status !== "cancelled" &&
                order.status !== "refunded" &&
                order.status !== "pending_payment";

              return (
                <div
                  key={order.id}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-card)",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Order Header: ID, Date, Status */}
                  <div
                    style={{
                      padding: "1.25rem 1.5rem",
                      background: "var(--color-surface)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "1.0625rem",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                          letterSpacing: "0.02em",
                          margin: 0,
                        }}
                      >
                        ORDER #{order.order_number}
                      </h2>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                          color: "var(--color-muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        <Calendar size={13} color="var(--color-muted)" />
                        {formattedDate}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={statusVariant(order.status)}
                      style={{
                        fontSize: "0.8125rem",
                        padding: "0.35rem 0.75rem",
                        fontFamily: "var(--font-subheading)",
                        fontWeight: 500,
                      }}
                    >
                      {statusLabel(order.status)}
                    </Badge>
                  </div>

                  {/* Actions Footer */}
                  <div
                    style={{
                      padding: "1rem 1.5rem",
                      background: "var(--color-card)",
                      borderTop: "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      style={{
                        fontSize: "0.8125rem",
                        fontFamily: "var(--font-subheading)",
                        fontWeight: 500,
                        color: "var(--color-primary)",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        padding: "0.5rem 1rem",
                        borderRadius: "var(--radius-md)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        transition: "background 0.15s ease",
                      }}
                    >
                      View Order Details <ChevronRight size={14} />
                    </Link>

                    {canTrack && (
                      <a
                        href="https://www.shiprocket.in/shipment-tracking/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.8125rem",
                          fontFamily: "var(--font-subheading)",
                          fontWeight: 500,
                          background: "linear-gradient(135deg, #1F3A2E 0%, #2D5241 100%)",
                          color: "#FFFFFF",
                          padding: "0.5rem 1rem",
                          borderRadius: "var(--radius-md)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          boxShadow: "0 2px 6px rgba(31,58,46,0.18)",
                        }}
                      >
                        <Truck size={14} /> Track Live Delivery
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Load More Pagination Trigger */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "1rem", paddingTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => void loadMoreOrders()}
                  disabled={loadingMore}
                  style={{
                    padding: "0.625rem 1.5rem",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-subheading)",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "var(--color-primary)",
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    opacity: loadingMore ? 0.7 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {loadingMore ? "Loading more orders..." : "Load More Orders"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
