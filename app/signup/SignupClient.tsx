"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessState, ErrorState } from "@/components/ui/states";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Full name is required";

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!phone.trim()) {
      e.phone = "Mobile number is required";
    } else if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      e.phone = "Enter a valid 10-digit mobile number";
    }

    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";

    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";

    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";
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
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes("already registered") || authError.message?.toLowerCase().includes("exists")) {
          setError("An account with this email already exists. Please sign in.");
        } else {
          setError("Sign up could not be completed. Please check your information and try again.");
        }
        return;
      }
      setSuccess(true);
    } catch {
      setError("Unable to connect to the registration service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
        <div style={{ maxWidth: "460px", width: "100%" }}>
          <SuccessState
            layout="card"
            title="Check your email"
            description={
              <span>
                We've sent a confirmation link to <strong>{email}</strong>. Click the link in your inbox to activate your account.
              </span>
            }
            primaryAction={{
              label: "Go to Sign In",
              onClick: () => router.push(`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`),
            }}
            className="py-8"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
            Create an account
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
            Join FarmSmith Foods
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
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <Input
              id="signup-name"
              label="Full Name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="e.g. Ramesh Kumar"
              required
            />

            <Input
              id="signup-phone"
              label="Mobile Number"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              placeholder="10-digit mobile number"
              required
            />

            <Input
              id="signup-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              required
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="At least 8 characters"
              required
            />

            <Input
              id="signup-confirm-password"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
              required
            />

            {error && (
              <ErrorState
                layout="inline"
                title="Registration failed"
                description={error}
                role="alert"
                ariaLive="assertive"
              />
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} id="signup-submit">
              Create Account
            </Button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--color-muted)" }}>
          Already have an account?{" "}
          <Link href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignupSkeleton() {
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
        padding: "2rem 1rem",
      }}
    >
      <span className="sr-only">Loading sign up page...</span>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div className="skeleton" style={{ width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto" }} />
          <div className="skeleton" style={{ width: "200px", height: "1.75rem" }} />
          <div className="skeleton" style={{ width: "160px", height: "0.875rem" }} />
        </div>
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.125rem",
          }}
        >
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-md)", marginTop: "0.5rem" }} />
        </div>
      </div>
    </div>
  );
}

export default function SignupClient() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}
