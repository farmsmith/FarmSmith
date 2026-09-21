"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import OrderTrackingForm from "@/components/order/OrderTrackingForm";
import { ArrowRight, Package, Sparkles } from "lucide-react";

export default function TrackClient() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);

  return (
    <div
      style={{
        background: "var(--color-background)",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        paddingBlock: "3.5rem",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>
            Order Tracking
          </p>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
              fontWeight: 600,
              color: "var(--color-primary)",
              marginBottom: "0.75rem",
            }}
          >
            Where&apos;s your order?
          </h1>
          <p
            style={{
              color: "var(--color-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9375rem",
              marginBottom: "1.75rem",
              lineHeight: 1.6,
            }}
          >
            Enter your order number and the mobile number or email used at checkout to track real-time delivery progress.
          </p>

          {/* Quick link for logged-in users */}
          {userEmail && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem 1.25rem",
                background: "linear-gradient(135deg, rgba(31, 58, 46, 0.08) 0%, rgba(217, 164, 65, 0.12) 100%)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <Package size={18} color="var(--color-primary)" />
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-body)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Logged in as <strong>{userEmail}</strong>
                </span>
              </div>
              <Link
                href="/account/orders"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8125rem",
                  fontFamily: "var(--font-subheading)",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  background: "var(--color-card)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                Go to My Orders <ArrowRight size={13} />
              </Link>
            </div>
          )}

          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(1.5rem, 4vw, 2.25rem)",
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
