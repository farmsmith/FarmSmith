"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessState, ErrorState } from "@/components/ui/states";

export default function ResetPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("Enter a valid email"); return; }
    setEmailError(undefined);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset link.");
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/">
            <Image
              src="/images/farmsmith_circle_logo.png"
              alt="FarmSmith Foods"
              width={56}
              height={56}
              style={{ borderRadius: "50%", margin: "0 auto 0.75rem" }}
            />
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.75rem",
              color: "var(--color-primary)",
              marginBottom: "0.375rem",
            }}
          >
            Reset your password
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
            {sent
              ? "Check your inbox for the reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {sent ? (
            <SuccessState
              layout="card"
              title="Reset link sent"
              description={
                <span>
                  We sent a reset link to <strong style={{ color: "var(--color-primary)" }}>{email}</strong>. Check your inbox to choose a new password.
                </span>
              }
              primaryAction={{
                label: "Back to Sign In",
                href: "/login",
              }}
              className="py-4"
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <Input
                id="reset-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                placeholder="you@example.com"
                required
              />

              {error && (
                <ErrorState
                  layout="inline"
                  title="Could not send reset link"
                  description={error}
                  role="alert"
                  ariaLive="assertive"
                />
              )}

              <Button type="submit" variant="primary" size="lg" loading={loading} id="reset-submit">
                Send Reset Link
              </Button>

              <div style={{ textAlign: "center" }}>
                <Link href="/login" style={{ fontSize: "0.875rem", color: "var(--color-muted)", textDecoration: "none" }}>
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
