"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, Key, Smartphone, Mail, ClipboardPaste, Check } from "lucide-react";
import { ErrorState } from "@/components/ui/states";

export default function OrderTrackingForm() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [useTokenMode, setUseTokenMode] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [errors, setErrors] = useState<{ orderNumber?: string; identifier?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handlePasteToken = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setIdentifier(text.trim());
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch {
      // Browser clipboard permission denied or unsupported
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!orderNumber.trim()) e.orderNumber = "Order number is required";
    if (!identifier.trim()) {
      e.identifier = useTokenMode ? "Tracking key is required" : "Phone number or email is required";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError(null);

    const cleanOrderNumber = orderNumber.trim();
    const cleanIdentifier = identifier.trim();

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: cleanOrderNumber,
          identifier: cleanIdentifier,
        }),
      });

      if (res.status === 404) {
        setApiError(
          useTokenMode
            ? "We couldn't find an order matching that Order Number and Tracking Key. Please verify your details."
            : "We couldn't find an order matching that Order Number and Mobile Number / Email. Please check and try again."
        );
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Redirect to public order page with verified identifier
      router.push(`/order/${encodeURIComponent(cleanOrderNumber)}?identifier=${encodeURIComponent(cleanIdentifier)}`);
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
        placeholder="e.g. FS-2026-4C6E0A"
        autoComplete="off"
        hint="Found in your order confirmation SMS or email"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <label htmlFor="track-identifier" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-foreground)" }}>
            {useTokenMode ? "Tracking Access Key" : "Mobile Number or Email"}
          </label>
          
          {useTokenMode && (
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
              title="Paste Tracking Key from clipboard"
              id="paste-tracking-key-btn"
            >
              {pasted ? <Check size={13} style={{ color: "var(--color-primary)" }} /> : <ClipboardPaste size={13} />}
              <span>{pasted ? "Pasted!" : "Paste from Clipboard"}</span>
            </button>
          )}
        </div>

        <Input
          id="track-identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
          placeholder={useTokenMode ? "Paste long tracking key (tf-...)" : "e.g. 9876543210 or your@email.com"}
          autoComplete={useTokenMode ? "off" : "email"}
          hint={
            useTokenMode
              ? "Unique tracking key from order details"
              : "Used during checkout to verify ownership"
          }
        />

        {/* Toggle mode button */}
        <div style={{ marginTop: "0.25rem" }}>
          <button
            type="button"
            onClick={() => {
              setUseTokenMode(!useTokenMode);
              setErrors({});
              setApiError(null);
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              fontSize: "0.8125rem",
              color: "var(--color-accent)",
              cursor: "pointer",
              textDecoration: "underline",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            {useTokenMode ? (
              <>
                <Smartphone size={13} />
                <span>Track with Mobile Number or Email instead</span>
              </>
            ) : (
              <>
                <Key size={13} />
                <span>Have a secret Tracking Key instead?</span>
              </>
            )}
          </button>
        </div>
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
        style={{ width: "100%", marginTop: "0.25rem" }}
        id="track-order-submit"
      >
        <Search size={18} aria-hidden="true" />
        Track Order
      </Button>
    </form>
  );
}
