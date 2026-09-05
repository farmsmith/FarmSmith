"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, ClipboardPaste, Check } from "lucide-react";
import { ErrorState } from "@/components/ui/states";

export default function OrderTrackingForm() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [token, setToken] = useState("");
  const [pasted, setPasted] = useState(false);
  const [errors, setErrors] = useState<{ orderNumber?: string; token?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handlePasteToken = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setToken(text.trim());
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch {
      // Browser permission denied or unsupported
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!orderNumber.trim()) e.orderNumber = "Order number is required";
    if (!token.trim()) e.token = "Tracking token is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          trackingToken: token.trim(),
        }),
      });

      if (res.status === 404) {
        // Deliberately vague — don't reveal whether order number or token was wrong
        setApiError("We couldn't find an order matching those details. Please check your order number and tracking token.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Redirect to the order page
      router.push(`/order/${orderNumber.trim()}?token=${token.trim()}`);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <Input
        id="track-order-number"
        label="Order Number"
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
        error={errors.orderNumber}
        placeholder="FS-2026-000001"
        autoComplete="off"
        hint="Found in your confirmation email"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label htmlFor="track-token" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-foreground)" }}>
            Tracking Access Key
          </label>
          <button
            type="button"
            onClick={handlePasteToken}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              background: pasted ? "rgba(22, 101, 52, 0.15)" : "rgba(22, 101, 52, 0.08)",
              border: "1px solid " + (pasted ? "rgba(22, 101, 52, 0.3)" : "rgba(22, 101, 52, 0.2)"),
              color: "var(--color-primary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Paste Tracking Access Key from clipboard"
            id="paste-tracking-key-btn"
          >
            {pasted ? <Check size={13} style={{ color: "var(--color-primary)" }} /> : <ClipboardPaste size={13} />}
            <span>{pasted ? "Pasted!" : "Paste from Clipboard"}</span>
          </button>
        </div>
        <Input
          id="track-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          error={errors.token}
          placeholder="Paste long tracking key here..."
          autoComplete="off"
          hint="Check your order confirmation email for this key"
        />
      </div>

      {apiError && (
        <ErrorState
          layout="inline"
          title="Lookup failed"
          description={apiError}
          role="alert"
          ariaLive="assertive"
        />
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        style={{ width: "100%" }}
        id="track-order-submit"
      >
        <Search size={18} aria-hidden="true" />
        Track Order
      </Button>
    </form>
  );
}
