"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Invalid email or password. Please check your credentials and try again.");
        return;
      }
      router.push(redirectTo);
    } catch {
      setError("Unable to connect to the authentication service. Please try again.");
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
        {/* Logo */}
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
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
            Sign in to your FarmSmith account
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
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Input
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              required
            />
            <div>
              <Input
                id="login-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                required
              />
              <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
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

            <Button type="submit" variant="primary" size="lg" loading={loading} id="login-submit">
              Sign In
            </Button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--color-muted)" }}>
          Don't have an account?{" "}
          <Link href={`/signup${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
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
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "2rem",
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
