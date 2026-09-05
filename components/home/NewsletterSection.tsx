"use client";

import React, { useState } from "react";
import { Heart, Send, CheckCircle2 } from "lucide-react";

import { FieldError } from "@/components/ui/FieldError";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);
    setSubscribed(true);
  };

  return (
    <section
      style={{
        background: "var(--color-primary-dark)",
        color: "#FFFFFF",
        paddingBlock: "5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", paddingInline: "1rem", textAlign: "center" }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(217, 164, 65, 0.3)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(2rem, 5vw, 3.5rem)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(217, 164, 65, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              color: "#D9A441",
            }}
          >
            <Heart size={24} />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
              color: "#FFFFFF",
              marginBottom: "0.75rem",
            }}
          >
            Join the <span style={{ color: "#D9A441" }}>FarmSmith Family</span>
          </h2>

          <p style={{ color: "rgba(251, 250, 246, 0.85)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem", maxWidth: "520px", marginInline: "auto" }}>
            Subscribe for fresh batch release alerts, lab report updates, and traditional organic recipes straight to your inbox.
          </p>

          {subscribed ? (
            <div
              role="status"
              aria-live="polite"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(5, 150, 105, 0.2)",
                border: "1px solid #059669",
                color: "#6EE7B7",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9375rem",
              }}
            >
              <CheckCircle2 size={18} aria-hidden="true" /> Thank you for subscribing to FarmSmith Journal!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", width: "100%", flexWrap: "wrap" }}>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your email address..."
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "newsletter-email-error" : undefined}
                  style={{
                    flex: "1 1 240px",
                    height: "3rem",
                    paddingInline: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: error ? "1.5px solid #EF4444" : "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0, 0, 0, 0.25)",
                    color: "#FFFFFF",
                    fontSize: "0.875rem",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#D9A441",
                    color: "#1F3A2E",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    paddingInline: "1.5rem",
                    height: "3rem",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Subscribe <Send size={16} />
                </button>
              </div>
              <FieldError id="newsletter-email-error" message={error} className="text-[#FCA5A5] self-start" />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
