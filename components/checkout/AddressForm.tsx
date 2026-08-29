"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { CheckoutRequest } from "@/types/payment";

type AddressData = CheckoutRequest["shippingAddress"];
type CustomerData = CheckoutRequest["customer"];

interface AddressFormData {
  address: AddressData;
  customer: CustomerData;
}

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  loading?: boolean;
  initialValues?: AddressFormData | null;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const PHONE_REGEX = /^(\+91[-\s]?)?[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;

const INDIAN_STATE_OPTIONS = [
  { label: "Select State *", value: "" },
  { label: "Andaman and Nicobar Islands", value: "Andaman and Nicobar Islands" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chandigarh", value: "Chandigarh" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Dadra and Nagar Haveli and Daman and Diu", value: "Dadra and Nagar Haveli and Daman and Diu" },
  { label: "Delhi", value: "Delhi" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Ladakh", value: "Ladakh" },
  { label: "Lakshadweep", value: "Lakshadweep" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Puducherry", value: "Puducherry" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" },
];

function validate(vals: {
  name: string; email: string; phone: string;
  line1: string; city: string; state: string; pincode: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!vals.name.trim()) errors.name = "Full name is required";
  else if (vals.name.trim().length > 200) errors.name = "Name is too long";

  if (!vals.email.trim()) errors.email = "Email address is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email)) errors.email = "Enter a valid email address";
  else if (vals.email.length > 320) errors.email = "Email is too long";

  if (!vals.phone.trim()) errors.phone = "Phone number is required";
  else if (!PHONE_REGEX.test(vals.phone.trim())) errors.phone = "Enter a valid 10-digit Indian mobile number";

  if (!vals.line1.trim()) errors.line1 = "Address Line 1 is required";
  else if (vals.line1.trim().length > 300) errors.line1 = "Address is too long";

  if (!vals.city.trim()) errors.city = "City is required";
  if (!vals.state.trim()) errors.state = "Please select a State";

  if (!vals.pincode.trim()) errors.pincode = "Pincode is required";
  else if (!PINCODE_REGEX.test(vals.pincode.trim())) errors.pincode = "Enter a valid 6-digit pincode";

  return errors;
}

export default function AddressForm({ onSubmit, loading, initialValues }: AddressFormProps) {
  const [vals, setVals] = useState({
    name: initialValues?.customer.name ?? "",
    email: initialValues?.customer.email ?? "",
    phone: initialValues?.customer.phone ?? "",
    line1: initialValues?.address.line1 ?? "",
    line2: initialValues?.address.line2 ?? "",
    city: initialValues?.address.city ?? "",
    state: initialValues?.address.state ?? "",
    pincode: initialValues?.address.pincode ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = (field: string, value: string) => {
    setVals((v) => ({ ...v, [field]: value }));
    if (touched[field]) {
      const newErrors = validate({ ...vals, [field]: value });
      setErrors(newErrors);
    }
  };

  const touch = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const newErrors = validate(vals);
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(vals);
    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, line1: true, city: true, state: true, pincode: true });
    if (Object.keys(newErrors).length > 0) return;

    const address: AddressData = {
      line1: vals.line1.trim(),
      ...(vals.line2.trim() ? { line2: vals.line2.trim() } : {}),
      city: vals.city.trim(),
      state: vals.state.trim(),
      pincode: vals.pincode.trim(),
    };
    const customer: CustomerData = {
      name: vals.name.trim(),
      email: vals.email.trim(),
      phone: vals.phone.trim(),
    };

    onSubmit({ address, customer });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Customer details */}
      <fieldset style={{ border: "none", padding: 0, marginBottom: "2rem" }}>
        <legend
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--color-primary)",
            marginBottom: "1.25rem",
            display: "block",
            width: "100%",
          }}
        >
          Contact Details
        </legend>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
          <Input
            id="checkout-name"
            label="Full Name *"
            autoComplete="name"
            value={vals.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => touch("name")}
            error={touched.name ? errors.name : undefined}
            placeholder="Priya Sharma"
            required
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Input
              id="checkout-email"
              label="Email *"
              type="email"
              autoComplete="email"
              value={vals.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => touch("email")}
              error={touched.email ? errors.email : undefined}
              placeholder="priya@example.com"
              required
            />
            <Input
              id="checkout-phone"
              label="Phone *"
              type="tel"
              autoComplete="tel"
              value={vals.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => touch("phone")}
              error={touched.phone ? errors.phone : undefined}
              placeholder="9876543210"
              hint="10-digit mobile number"
              required
            />
          </div>
        </div>
      </fieldset>

      {/* Shipping address */}
      <fieldset style={{ border: "none", padding: 0, marginBottom: "2rem" }}>
        <legend
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--color-primary)",
            marginBottom: "1.25rem",
            display: "block",
            width: "100%",
          }}
        >
          Shipping Address
        </legend>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
          <Input
            id="checkout-line1"
            label="Address Line 1 *"
            autoComplete="address-line1"
            value={vals.line1}
            onChange={(e) => set("line1", e.target.value)}
            onBlur={() => touch("line1")}
            error={touched.line1 ? errors.line1 : undefined}
            placeholder="Flat 4B, Sunrise Apartments, Street 12"
            required
          />
          <Input
            id="checkout-line2"
            label="Address Line 2 (Optional)"
            autoComplete="address-line2"
            value={vals.line2}
            onChange={(e) => set("line2", e.target.value)}
            placeholder="Landmark, Building name (Optional)"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Input
              id="checkout-city"
              label="City *"
              autoComplete="address-level2"
              value={vals.city}
              onChange={(e) => set("city", e.target.value)}
              onBlur={() => touch("city")}
              error={touched.city ? errors.city : undefined}
              placeholder="Chennai"
              required
            />
            <Input
              id="checkout-pincode"
              label="Pincode *"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              value={vals.pincode}
              onChange={(e) => set("pincode", e.target.value)}
              onBlur={() => touch("pincode")}
              error={touched.pincode ? errors.pincode : undefined}
              placeholder="600001"
              required
            />
          </div>

          {/* State Dropdown */}
          <Select
            id="checkout-state"
            label="State *"
            value={vals.state}
            onChange={(e) => set("state", e.target.value)}
            onBlur={() => touch("state")}
            error={touched.state ? errors.state : undefined}
            options={INDIAN_STATE_OPTIONS}
            required
          />
        </div>
      </fieldset>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        style={{ width: "100%" }}
        id="checkout-submit-address"
      >
        Continue to Payment
      </Button>
    </form>
  );
}
