"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Truck, Sparkles, MessageCircle, Eye, EyeOff } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/states";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      e.email = "Enter a valid email address";
    }
    if (!password) {
      e.password = "Password is required";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) {
        setError("Invalid email or password. Please check your credentials and try again.");
        return;
      }
      router.push(redirectTo);
    } catch {
      setError("Unable to connect to the authentication service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 4.25rem)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "2rem 1rem 3rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <Link href="/" aria-label="Go to Home">
            <Image
              src="/images/farmsmith_circle_logo.png"
              alt="FarmSmith Foods"
              width={48}
              height={48}
              style={{ borderRadius: "50%", margin: "0 auto 0.375rem" }}
            />
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              color: "var(--color-primary)",
              marginBottom: "0.125rem",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
            Sign in to your FarmSmith account
          </p>
        </div>

        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "1.75rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <Input
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              placeholder="you@example.com"
              required
            />
            <div>
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                placeholder="••••••••"
                required
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.25rem",
                      color: "var(--color-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                }
              />
              <div style={{ textAlign: "right", marginTop: "0.375rem" }}>
                <Link
                  href="/reset-password"
                  style={{ fontSize: "0.8125rem", color: "var(--color-accent)", textDecoration: "none" }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <ErrorState
                layout="inline"
                title="Sign in failed"
                description={error}
                role="alert"
                ariaLive="assertive"
              />
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} id="login-submit" style={{ width: "100%" }}>
              Sign In
            </Button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem", color: "var(--color-muted)" }}>
          Don't have an account?{" "}
          <Link href={`/signup${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </p>


        {/* Member Benefits / Trust Highlights (Mobile view only) */}
        <div
          className="mobile-only-benefits md:hidden"
          style={{
            marginTop: "1.5rem",
            padding: "1.125rem 1.25rem",
            background: "rgba(31, 58, 46, 0.04)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              .mobile-only-benefits {
                display: none !important;
              }
            }
          `}</style>
          <p
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 700,
              color: "var(--color-primary)",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            FarmSmith Account Benefits
          </p>


          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(46, 125, 50, 0.12)",
                  color: "#2E7D32",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Truck size={15} />
              </div>
              <div>
                <strong style={{ fontSize: "0.8125rem", color: "var(--color-primary)", display: "block" }}>
                  Live Order Tracking
                </strong>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                  Real-time updates on your shipment & delivery
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(217, 164, 65, 0.15)",
                  color: "var(--color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={15} />
              </div>
              <div>
                <strong style={{ fontSize: "0.8125rem", color: "var(--color-primary)", display: "block" }}>
                  1-Click Reordering
                </strong>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                  Saved shipping addresses & fast checkout
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(31, 58, 46, 0.1)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={15} />
              </div>
              <div>
                <strong style={{ fontSize: "0.8125rem", color: "var(--color-primary)", display: "block" }}>
                  100% Certified Organic
                </strong>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                  Lab batch tested GI-tagged turmeric & natural harvest
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "0.875rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--color-border)",
              textAlign: "center",
            }}
          >
            <Link
              href="/contact"
              style={{
                fontSize: "0.75rem",
                color: "var(--color-accent)",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <MessageCircle size={14} /> Need help? Contact FarmSmith Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


function LoginSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "calc(100vh - 4.25rem)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "2.5rem 1rem",
      }}
    >



      <span className="sr-only">Loading sign in page...</span>
      <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div className="skeleton" style={{ width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto" }} />
          <div className="skeleton" style={{ width: "180px", height: "1.75rem" }} />
          <div className="skeleton" style={{ width: "220px", height: "0.875rem" }} />
        </div>
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)", marginTop: "0.5rem" }} />
        </div>
      </div>
    </div>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
