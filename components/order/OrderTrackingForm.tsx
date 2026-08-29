"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";

export default function OrderTrackingForm() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<{ orderNumber?: string; token?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
      <Input
        id="track-token"
        label="Tracking Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        error={errors.token}
        placeholder="abc123..."
        autoComplete="off"
        hint="Also in your confirmation email"
      />

      {apiError && (
        <div
          role="alert"
          style={{
            background: "var(--color-error-bg)",
            border: "1px solid var(--color-error)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem 1rem",
            fontSize: "0.875rem",
            color: "var(--color-error)",
          }}
        >
          {apiError}
        </div>
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
