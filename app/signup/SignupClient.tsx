"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) {
      e.name = "Full name is required";
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!phone.trim()) {
      e.phone = "Mobile number is required";
    } else if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      e.phone = "Enter a valid 10-digit mobile number";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      e.email = "Enter a valid email address";
    }

    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 8) {
      e.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (password && password !== confirmPassword) {
      e.confirmPassword = "Passwords do not match";
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
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
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
      setError("Unable to connect to the registration service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 4.25rem)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "var(--color-background)",
          padding: "2.5rem 1rem",
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
        minHeight: "calc(100vh - 4.25rem)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "2.5rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
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
            Create an account
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
            Join FarmSmith Foods
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
              id="signup-name"
              label="Full Name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
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
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              placeholder="you@example.com"
              required
            />

            <Input
              id="signup-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              placeholder="At least 8 characters"
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

            <Input
              id="signup-confirm-password"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                  {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              }
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

            <Button type="submit" variant="primary" size="lg" loading={loading} id="signup-submit" style={{ width: "100%" }}>
              Create Account
            </Button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem", color: "var(--color-muted)" }}>
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
        minHeight: "calc(100vh - 4.25rem)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "2.5rem 1rem",
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
