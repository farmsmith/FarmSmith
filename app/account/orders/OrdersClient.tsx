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
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils/cn";
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
          <>
            <style>{`
              @keyframes orderCardFade {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .order-card-luxury {
                animation: orderCardFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.22s ease;
              }
              .order-card-luxury:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 28px rgba(31, 58, 46, 0.08) !important;
                border-color: rgba(31, 58, 46, 0.25) !important;
              }
              .order-btn-details:hover {
                background: rgba(31, 58, 46, 0.06) !important;
                border-color: var(--color-primary) !important;
                color: var(--color-primary) !important;
              }
              .order-btn-track:hover {
                box-shadow: 0 4px 14px rgba(31, 58, 46, 0.32) !important;
                transform: translateY(-1px);
              }
            `}</style>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {orders.map((order, idx) => {
                const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                const canTrack =
                  order.status !== "cancelled" &&
                  order.status !== "refunded" &&
                  order.status !== "pending_payment";

                const totalItemsCount =
                  order.items && order.items.length > 0
                    ? order.items.reduce((s, i) => s + (i.quantity || 1), 0)
                    : null;

                return (
                  <div
                    key={order.id}
                    className="order-card-luxury"
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "16px",
                      background: "var(--color-card)",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    {/* Order Card Header */}
                    <div
                      style={{
                        padding: "1.25rem 1.5rem",
                        background: "linear-gradient(180deg, rgba(31, 58, 46, 0.04) 0%, rgba(31, 58, 46, 0.01) 100%)",
                        borderBottom: "1px solid var(--color-border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, rgba(31, 58, 46, 0.1) 0%, rgba(196, 136, 62, 0.15) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-primary)",
                            flexShrink: 0,
                          }}
                        >
                          <Package size={20} strokeWidth={2} />
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <h2
                              style={{
                                fontFamily: "var(--font-heading)",
                                fontSize: "1.0625rem",
                                fontWeight: 700,
                                color: "var(--color-primary)",
                                letterSpacing: "0.02em",
                                margin: 0,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                              }}
                            >
                              <span>ORDER</span>
                              <code
                                style={{
                                  background: "rgba(31, 58, 46, 0.07)",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  color: "var(--color-primary)",
                                  fontSize: "0.95rem",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                #{order.order_number}
                              </code>
                            </h2>
                          </div>

                          <span
                            style={{
                              fontSize: "0.8125rem",
                              fontFamily: "var(--font-body)",
                              fontWeight: 400,
                              color: "var(--color-muted)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              marginTop: "0.2rem",
                            }}
                          >
                            <Calendar size={13} color="var(--color-muted)" />
                            Placed on {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status & Price Pill */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <Badge
                          variant={statusVariant(order.status)}
                          style={{
                            fontSize: "0.8125rem",
                            padding: "0.35rem 0.85rem",
                            fontFamily: "var(--font-subheading)",
                            fontWeight: 600,
                            borderRadius: "999px",
                          }}
                        >
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Card Body (Items preview & Total) */}
                    <div
                      style={{
                        padding: "1.25rem 1.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1.25rem",
                        background: "var(--color-card)",
                      }}
                    >
                      {/* Left: Items list / summary */}
                      <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                        {order.items && order.items.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {order.items.slice(0, 3).map((item, i) => (
                              <div
                                key={item.id || i}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "0.75rem",
                                  fontSize: "0.875rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "var(--font-subheading)",
                                    fontWeight: 500,
                                    color: "var(--color-foreground)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.product_name}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    color: "var(--color-muted)",
                                    fontSize: "0.8125rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span style={{ fontSize: "0.78rem", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                                + {order.items.length - 3} more item(s)
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-muted)", fontSize: "0.875rem" }}>
                            <ShoppingBag size={15} color="var(--color-accent)" />
                            <span>Standard Order Shipment</span>
                          </div>
                        )}

                        {/* Courier / Tracking badge if available */}
                        {order.awb_code && (
                          <div
                            style={{
                              marginTop: "0.625rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.25rem 0.625rem",
                              borderRadius: "6px",
                              background: "rgba(31, 58, 46, 0.05)",
                              fontSize: "0.78rem",
                              fontFamily: "var(--font-subheading)",
                              color: "var(--color-primary)",
                              fontWeight: 500,
                            }}
                          >
                            <Truck size={13} color="var(--color-accent)" />
                            <span>{order.courier_name || "Shiprocket"}: {order.awb_code}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Total Amount Display */}
                      <div
                        style={{
                          textAlign: "right",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          paddingLeft: "1rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontFamily: "var(--font-body)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "var(--color-muted)",
                            fontWeight: 500,
                          }}
                        >
                          {totalItemsCount ? `Total (${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'})` : "Total Amount"}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1.375rem",
                            fontWeight: 700,
                            color: "var(--color-primary)",
                            lineHeight: 1.2,
                            marginTop: "0.15rem",
                          }}
                        >
                          {formatPrice(order.total_amount, order.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div
                      style={{
                        padding: "0.875rem 1.5rem",
                        background: "var(--color-surface)",
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
                        className="order-btn-details"
                        style={{
                          fontSize: "0.8125rem",
                          fontFamily: "var(--font-subheading)",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          padding: "0.5rem 1.125rem",
                          borderRadius: "var(--radius-md)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          transition: "all 0.15s ease",
                        }}
                      >
                        View Order Details <ChevronRight size={14} />
                      </Link>

                      {canTrack && (
                        <a
                          href="https://www.shiprocket.in/shipment-tracking/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-btn-track"
                          style={{
                            fontSize: "0.8125rem",
                            fontFamily: "var(--font-subheading)",
                            fontWeight: 600,
                            background: "linear-gradient(135deg, #1F3A2E 0%, #2D5241 100%)",
                            color: "#FFFFFF",
                            padding: "0.5rem 1.125rem",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            boxShadow: "0 2px 8px rgba(31,58,46,0.22)",
                            transition: "all 0.15s ease",
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
          </>
        )}
      </div>
    </div>
  );
}
