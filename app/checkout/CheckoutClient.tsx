"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  CreditCard,
  ShieldCheck,
  Lock,
  ChevronRight,
  User,
  Zap,
  Edit2
} from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import RazorpayButton from "@/components/checkout/RazorpayButton";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/utils/cn";
import type { CheckoutRequest, CheckoutResponse } from "@/types/payment";

interface QuoteData {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

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

const ADDRESS_STORAGE_KEY = "farmsmith_saved_addresses_v1";
const CUSTOMER_STORAGE_KEY = "farmsmith_customer_info_v1";

export default function CheckoutClient() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  
  // Auth state
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Stepper Stage (1: Shipping/Contact, 2: Payment, 3: Review)
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);

  // Form State
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [shippingAddress, setShippingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Saved Delivery Addresses
  const [savedAddresses, setSavedAddresses] = useState<
    Array<{
      id: string;
      label: string;
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
      isDefault?: boolean;
    }>
  >([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(true);
  const [newAddressLabel, setNewAddressLabel] = useState<"Home" | "Office" | "Other">("Home");

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Quote & Checkout State
  const [quote, setQuote] = useState<QuoteData | null>(null);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutResponse | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-fill logged in user info & fetch saved addresses from localStorage / profile
  useEffect(() => {
    let localSavedAddrs: Array<any> = [];

    // 1. Load saved customer details from localStorage
    try {
      const storedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (storedCustomer) {
        const parsedCust = JSON.parse(storedCustomer);
        if (parsedCust && parsedCust.name) {
          setCustomer(parsedCust);
        }
      }
    } catch {
      // ignore
    }

    // 2. Load saved addresses from localStorage
    try {
      const storedAddrs = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (storedAddrs) {
        const parsedAddrs = JSON.parse(storedAddrs);
        if (Array.isArray(parsedAddrs) && parsedAddrs.length > 0) {
          localSavedAddrs = parsedAddrs;
          setSavedAddresses(parsedAddrs);

          const defaultAddr = parsedAddrs.find((a: any) => a.isDefault) || parsedAddrs[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setIsAddingNewAddress(false);
            setShippingAddress({
              line1: defaultAddr.line1,
              line2: defaultAddr.line2 || "",
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            });
          }
        }
      }
    } catch {
      // ignore
    }

    // 3. Supabase Auth Check
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsAuthenticated(true);
        const userFullName = user.user_metadata?.full_name || "";
        const userEmail = user.email || "";
        const userPhone = user.user_metadata?.phone || "";

        setCustomer((prev) => ({
          name: prev.name || userFullName,
          email: prev.email || userEmail,
          phone: prev.phone || userPhone,
        }));

        const metaLine1 = user.user_metadata?.address_line1 || user.user_metadata?.line1 || "";
        const metaCity = user.user_metadata?.city || "";
        const metaState = user.user_metadata?.state || "";
        const metaPincode = user.user_metadata?.pincode || "";

        if (metaLine1 && metaCity && metaState && metaPincode) {
          const userSavedAddr = {
            id: "user-default-addr",
            label: "Home",
            name: userFullName || "Default Address",
            line1: metaLine1,
            line2: user.user_metadata?.address_line2 || "",
            city: metaCity,
            state: metaState,
            pincode: metaPincode,
            phone: userPhone,
            isDefault: true,
          };

          if (!localSavedAddrs.some((a) => a.line1 === metaLine1 && a.pincode === metaPincode)) {
            const merged = [userSavedAddr, ...localSavedAddrs];
            setSavedAddresses(merged);
            setSelectedAddressId(userSavedAddr.id);
            setIsAddingNewAddress(false);
            setShippingAddress({
              line1: metaLine1,
              line2: user.user_metadata?.address_line2 || "",
              city: metaCity,
              state: metaState,
              pincode: metaPincode,
            });
          }
        }
      } else {
        setIsAuthenticated(false);
      }
      setSessionChecked(true);
    });
  }, []);

  // Fetch Shipping & Tax Quote
  const fetchQuote = useCallback(
    async (address: typeof shippingAddress) => {
      if (!items.length || !address.line1 || !address.city || !address.state || !address.pincode) return;
      try {
        const res = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            shippingAddress: address,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setQuote({
          subtotal: data.subtotal as number,
          shipping: data.shipping as number,
          tax: data.tax as number,
          total: data.total as number,
          currency: data.currency as string,
        });
      } catch {
        // Fallback calculation will handle
      }
    },
    [items]
  );

  useEffect(() => {
    if (shippingAddress.pincode.length === 6 && shippingAddress.line1 && shippingAddress.state && shippingAddress.city) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void fetchQuote(shippingAddress);
      }, 400);
    }
  }, [shippingAddress, fetchQuote]);

  // Stage 1 Validation
  const validateStage1 = () => {
    const errs: Record<string, string> = {};
    if (!customer.name.trim()) errs.name = "Full name is required";
    if (!customer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errs.email = "Valid email is required";
    if (!customer.phone.trim() || !/^(\+91[-\s]?)?[6-9]\d{9}$/.test(customer.phone.trim())) errs.phone = "Valid 10-digit mobile number required";
    if (!shippingAddress.line1.trim()) errs.line1 = "Address line 1 is required";
    if (!shippingAddress.city.trim()) errs.city = "City is required";
    if (!shippingAddress.state.trim()) errs.state = "Select a state";
    if (!shippingAddress.pincode.trim() || !/^\d{6}$/.test(shippingAddress.pincode.trim())) errs.pincode = "Enter valid 6-digit pincode";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToStage2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStage1()) return;

    // Save customer info and address locally for future visits
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));

      const activeId = selectedAddressId !== "new" ? selectedAddressId : `addr_${Date.now()}`;
      const addrToSave = {
        id: activeId,
        label: newAddressLabel || "Home",
        name: customer.name,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        phone: customer.phone,
        isDefault: true,
      };

      const updatedAddrs = [
        addrToSave,
        ...savedAddresses.filter((a) => a.id !== activeId).map((a) => ({ ...a, isDefault: false })),
      ];

      setSavedAddresses(updatedAddrs);
      setSelectedAddressId(addrToSave.id);
      setIsAddingNewAddress(false);
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updatedAddrs));
    } catch {
      // ignore storage errors
    }

    await fetchQuote(shippingAddress);
    setCurrentStage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedToStage3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sameAsBilling) {
      const errs: Record<string, string> = {};
      if (!billingAddress.line1.trim()) errs.billingLine1 = "Billing address line 1 is required";
      if (!billingAddress.city.trim()) errs.billingCity = "Billing city is required";
      if (!billingAddress.state.trim()) errs.billingState = "Billing state is required";
      if (!billingAddress.pincode.trim() || !/^\d{6}$/.test(billingAddress.pincode.trim())) errs.billingPincode = "Valid pincode required";
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }
    }
    setCheckoutError(null);
    setCurrentStage(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!checkoutResponse) {
      void createCheckoutOrder();
    }
  };

  const createCheckoutOrder = async (): Promise<CheckoutResponse | null> => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const body: CheckoutRequest = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
        },
        shippingAddress: {
          line1: shippingAddress.line1.trim(),
          ...(shippingAddress.line2.trim() ? { line2: shippingAddress.line2.trim() } : {}),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          pincode: shippingAddress.pincode.trim(),
        },
      };

      const supabase = createBrowserSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const responseData = (await res.json()) as CheckoutResponse & { error?: string };
      if (!res.ok) {
        setCheckoutError(responseData.error ?? "Checkout order creation failed.");
        return null;
      }

      setCheckoutResponse(responseData);
      return responseData;
    } catch {
      setCheckoutError("Network error. Please try again.");
      return null;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const handlePaymentSuccess = (orderNumber: string, trackingToken: string) => {
    setIsOrderPlaced(true);
    clearCart();
    router.push(`/order/${orderNumber}?token=${trackingToken}`);
  };

  if (!sessionChecked) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="skeleton" style={{ width: "220px", height: "2rem" }} />
      </div>
    );
  }

  if (isOrderPlaced) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div
          className="skeleton"
          style={{ width: "48px", height: "48px", borderRadius: "50%", margin: "0 auto" }}
        />
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--color-primary)" }}>
          Order Confirmed!
        </h1>
        <p style={{ color: "var(--color-muted)" }}>Redirecting to your order tracking page...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2.5rem 2rem",
            textAlign: "center",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(196, 136, 62, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              color: "var(--color-accent)",
            }}
          >
            <User size={28} />
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>
            Account Required for Checkout
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            Please sign in to your account to proceed with secure checkout. Your cart items will be saved!
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <Link
              href="/login?redirect=/checkout"
              style={{
                background: "var(--color-primary)",
                color: "#FBFAF6",
                padding: "0.875rem 1.5rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                display: "block",
              }}
            >
              Sign In to Account
            </Link>
            <Link
              href="/signup?redirect=/checkout"
              style={{
                border: "1.5px solid var(--color-primary)",
                color: "var(--color-primary)",
                padding: "0.875rem 1.5rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                display: "block",
              }}
            >
              Register New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <ShoppingBag size={56} style={{ color: "var(--color-muted)", opacity: 0.4 }} aria-hidden="true" />
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", color: "var(--color-primary)" }}>
          Your cart is empty
        </h1>
        <p style={{ color: "var(--color-muted)" }}>Add something farm-fresh before checking out.</p>
        <Link
          href="/shop"
          style={{ background: "var(--color-primary)", color: "var(--color-card)", padding: "0.875rem 2rem", borderRadius: "var(--radius-md)", fontWeight: 600, textDecoration: "none" }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const hasAddress = Boolean(
    shippingAddress.pincode.trim().length === 6 ||
    (shippingAddress.state.trim() && shippingAddress.city.trim())
  );

  const calculatedShipping = quote
    ? quote.shipping
    : hasAddress
    ? 60
    : null;

  const rawSubtotal = items.reduce((acc, item) => acc + (item.price ?? (item as any).unitPrice ?? 0) * item.quantity, 0);
  const calculatedTax = quote ? quote.tax : 0;
  const calculatedTotal = rawSubtotal + (calculatedShipping ?? 0) + calculatedTax;

  return (
    <div style={{ background: "var(--color-background)", minHeight: "85vh", paddingInline: "0.75rem", paddingBlock: "1.5rem 6rem" }}>
      <style>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 960px) {
          .checkout-layout {
            grid-template-columns: 1.15fr 0.85fr;
            gap: 2.5rem;
          }
        }
        .checkout-card-form {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1rem;
          box-shadow: var(--shadow-card);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        @media (min-width: 640px) {
          .checkout-card-form {
            padding: 2rem;
            gap: 1.5rem;
          }
        }
        .checkout-card-form p,
        .checkout-card-form label,
        .checkout-card-form h2,
        .checkout-card-form h3,
        .checkout-card-form span {
          overflow-wrap: break-word;
          word-break: break-word;
          max-width: 100%;
        }
        .stepper-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          background: var(--color-card);
          padding: 0.75rem 0.875rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .stepper-bar {
            padding: 1rem 1.5rem;
            margin-bottom: 2.5rem;
          }
        }
        .stepper-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-muted);
          cursor: pointer;
          min-width: 0;
        }
        @media (min-width: 640px) {
          .stepper-item {
            gap: 0.5rem;
            font-size: 0.875rem;
          }
        }
        .stepper-item.active {
          color: var(--color-primary);
        }
        .stepper-item.completed {
          color: var(--color-accent);
        }
        .stepper-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          background: #E5E7EB;
          color: #4B5563;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .stepper-badge {
            width: 28px;
            height: 28px;
            font-size: 0.8125rem;
          }
        }
        .stepper-item.active .stepper-badge {
          background: var(--color-primary);
          color: #FFFFFF;
        }
        .stepper-item.completed .stepper-badge {
          background: var(--color-accent);
          color: #FFFFFF;
        }
        .form-grid-contact {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .form-grid-contact {
            grid-template-columns: 1fr 1fr;
          }
        }
        .form-grid-address {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.875rem;
        }
        @media (min-width: 640px) {
          .form-grid-address {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* 🌟 3-STAGE STEPPER HEADER */}
        <div className="stepper-bar">
          <div
            className={`stepper-item ${currentStage === 1 ? "active" : currentStage > 1 ? "completed" : ""}`}
            onClick={() => {
              setCurrentStage(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="stepper-badge">{currentStage > 1 ? <CheckCircle2 size={15} /> : "1"}</span>
            <span className="inline sm:hidden">Shipping</span>
            <span className="hidden sm:inline">Shipping & Contact</span>
          </div>

          <ChevronRight size={16} style={{ color: "var(--color-border)", flexShrink: 0 }} />

          <div
            className={`stepper-item ${currentStage === 2 ? "active" : currentStage > 2 ? "completed" : ""}`}
            onClick={() => {
              if (currentStage > 2 || validateStage1()) {
                setCurrentStage(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <span className="stepper-badge">{currentStage > 2 ? <CheckCircle2 size={15} /> : "2"}</span>
            <span className="inline sm:hidden">Payment</span>
            <span className="hidden sm:inline">Payment Details</span>
          </div>

          <ChevronRight size={16} style={{ color: "var(--color-border)", flexShrink: 0 }} />

          <div
            className={`stepper-item ${currentStage === 3 ? "active" : ""}`}
            onClick={() => {
              if (currentStage === 3) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <span className="stepper-badge">3</span>
            <span className="inline sm:hidden">Review</span>
            <span className="hidden sm:inline">Review & Order</span>
          </div>
        </div>

        <div className="checkout-layout">
          {/* LEFT COLUMN: 3-Stage Forms */}
          <div>
            {/* ========================================================
                STAGE 1: SHIPPING AND CONTACT INFORMATION
               ======================================================== */}
            {currentStage === 1 && (
              <form onSubmit={handleProceedToStage2} noValidate className="checkout-card-form">
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <Truck size={20} /> Contact & Delivery Address
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                    Enter your contact info and shipping location for delivery updates.
                  </p>
                </div>

                {/* Contact Section */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                  <Input
                    id="checkout-name"
                    label="Full Name *"
                    value={customer.name}
                    onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                    error={fieldErrors.name}
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                  <div className="form-grid-contact">
                    <Input
                      id="checkout-email"
                      label="Email Address *"
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                      error={fieldErrors.email}
                      placeholder="ramesh@gmail.com"
                      required
                    />
                    <Input
                      id="checkout-phone"
                      label="Mobile Number *"
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                      error={fieldErrors.phone}
                      placeholder="10-digit phone"
                      required
                    />
                  </div>
                </div>

                <div style={{ height: "1px", background: "var(--color-border)", margin: "0.5rem 0" }} />

                {/* Delivery Address Section (Saved Address Selection Cards) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", color: "var(--color-primary)", margin: 0 }}>
                      Delivery Address
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId("new");
                        setIsAddingNewAddress(true);
                        setShippingAddress({ line1: "", line2: "", city: "", state: "", pincode: "" });
                      }}
                      style={{ color: "#C4883E", background: "none", border: "none", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", padding: 0 }}
                    >
                      + Add New Address
                    </button>
                  </div>

                  {/* Saved Address Cards */}
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id && !isAddingNewAddress;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setIsAddingNewAddress(false);
                          setShippingAddress({
                            line1: addr.line1,
                            line2: addr.line2 || "",
                            city: addr.city,
                            state: addr.state,
                            pincode: addr.pincode,
                          });
                          if (addr.name) setCustomer((c) => ({ ...c, name: addr.name }));
                        }}
                        style={{
                          border: isSelected ? "2px solid #C4883E" : "1px solid #E5E7EB",
                          background: isSelected ? "#FAF6EE" : "#FFFFFF",
                          borderRadius: "var(--radius-md)",
                          padding: "1.125rem 1.25rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.375rem",
                          boxShadow: isSelected ? "0 2px 8px rgba(196, 136, 62, 0.12)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                border: isSelected ? "2px solid #C4883E" : "2px solid #9CA3AF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#C4883E" }} />}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1F2937", overflowWrap: "break-word", wordBreak: "break-word" }}>
                              {addr.name} — {addr.label}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                            {addr.isDefault ? (
                              <span
                                style={{
                                  background: "#C4883E",
                                  color: "#FFFFFF",
                                  fontSize: "0.6875rem",
                                  fontWeight: 800,
                                  padding: "0.25rem 0.6rem",
                                  borderRadius: "100px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                DEFAULT
                              </span>
                            ) : (
                              <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAddressId(addr.id);
                                    setIsAddingNewAddress(true);
                                  }}
                                  style={{ color: "#6B7280", background: "none", border: "none", fontSize: "0.8125rem", cursor: "pointer" }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextAddrs = savedAddresses.filter((a) => a.id !== addr.id);
                                    setSavedAddresses(nextAddrs);
                                    try {
                                      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(nextAddrs));
                                    } catch {
                                      // ignore
                                    }
                                    if (selectedAddressId === addr.id) {
                                      if (nextAddrs.length > 0) {
                                        setSelectedAddressId(nextAddrs[0].id);
                                        setIsAddingNewAddress(false);
                                        setShippingAddress({
                                          line1: nextAddrs[0].line1,
                                          line2: nextAddrs[0].line2 || "",
                                          city: nextAddrs[0].city,
                                          state: nextAddrs[0].state,
                                          pincode: nextAddrs[0].pincode,
                                        });
                                      } else {
                                        setSelectedAddressId("new");
                                        setIsAddingNewAddress(true);
                                      }
                                    }
                                  }}
                                  style={{ color: "#6B7280", background: "none", border: "none", fontSize: "0.8125rem", cursor: "pointer" }}
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ paddingLeft: "2.25rem" }}>
                          <p style={{ fontSize: "0.875rem", color: "#4B5563", margin: 0 }}>
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                          </p>
                          <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: "0.125rem", margin: 0 }}>
                            {addr.city}, {addr.state} {addr.pincode} · {addr.phone}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Inline Address Inputs Form (For New / Editing Address) */}
                  {(selectedAddressId === "new" || isAddingNewAddress) && (
                    <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "1.25rem", background: "#FFFFFF", display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        {(["Home", "Office", "Other"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewAddressLabel(type)}
                            style={{
                              padding: "0.35rem 0.85rem",
                              borderRadius: "100px",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              border: newAddressLabel === type ? "1.5px solid #C4883E" : "1px solid var(--color-border)",
                              background: newAddressLabel === type ? "rgba(196, 136, 62, 0.1)" : "transparent",
                              color: newAddressLabel === type ? "#C4883E" : "var(--color-foreground)",
                              cursor: "pointer",
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      <Input
                        id="checkout-line1"
                        label="Address Line 1 (Flat, House no., Street) *"
                        value={shippingAddress.line1}
                        onChange={(e) => setShippingAddress((a) => ({ ...a, line1: e.target.value }))}
                        error={fieldErrors.line1}
                        placeholder="e.g. House No. 42, Green Park Avenue"
                        required
                      />
                      <Input
                        id="checkout-line2"
                        label="Address Line 2 (Landmark / Sector — Optional)"
                        value={shippingAddress.line2}
                        onChange={(e) => setShippingAddress((a) => ({ ...a, line2: e.target.value }))}
                        placeholder="Near Central Park"
                      />
                      <div className="form-grid-address">
                        <Input
                          id="checkout-pincode"
                          label="Pincode *"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress((a) => ({ ...a, pincode: e.target.value }))}
                          error={fieldErrors.pincode}
                          placeholder="6-digits"
                          required
                        />
                        <Input
                          id="checkout-city"
                          label="City / District *"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress((a) => ({ ...a, city: e.target.value }))}
                          error={fieldErrors.city}
                          placeholder="e.g. Cuttack"
                          required
                        />
                        <Select
                          id="checkout-state"
                          label="State *"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress((a) => ({ ...a, state: e.target.value }))}
                          options={INDIAN_STATE_OPTIONS}
                          error={fieldErrors.state}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <Input
                    id="checkout-delivery-notes"
                    label="Delivery Instructions (Optional)"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Leave package with guard / Call before delivery"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" style={{ width: "100%", marginTop: "0.5rem" }}>
                  Continue to Payment →
                </Button>
              </form>
            )}

            {/* ========================================================
                STAGE 2: PAYMENT DETAILS & BILLING
               ======================================================== */}
            {currentStage === 2 && (
              <form onSubmit={handleProceedToStage3} noValidate className="checkout-card-form">
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <CreditCard size={20} /> Select Payment Method
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                    Choose your preferred secure payment method below.
                  </p>
                </div>

                {/* Payment Selection Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label
                    onClick={() => setPaymentMethod("online")}
                    style={{
                      border: paymentMethod === "online" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: paymentMethod === "online" ? "rgba(31, 58, 46, 0.04)" : "transparent",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem 1.25rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <CreditCard size={22} style={{ color: "var(--color-primary)" }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-primary)" }}>
                          Online Payment (UPI, Cards, NetBanking, Wallets)
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                          Secured via 256-bit encrypted Razorpay Gateway
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-accent)" }}>Fast & Safe</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("cod")}
                    style={{
                      border: paymentMethod === "cod" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: paymentMethod === "cod" ? "rgba(31, 58, 46, 0.04)" : "transparent",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem 1.25rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <Truck size={22} style={{ color: "var(--color-primary)" }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-primary)" }}>
                          Cash on Delivery (COD)
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                          Pay cash upon receiving your delivery
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ height: "1px", background: "var(--color-border)", margin: "0.5rem 0" }} />

                {/* Billing Address Option */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500, color: "var(--color-primary)" }}>
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
                    />
                    Billing address is same as shipping address
                  </label>

                  {!sameAsBilling && (
                    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                      <Input
                        id="billing-line1"
                        label="Billing Address Line 1 *"
                        value={billingAddress.line1}
                        onChange={(e) => setBillingAddress((b) => ({ ...b, line1: e.target.value }))}
                        error={fieldErrors.billingLine1}
                        placeholder="House / Street"
                      />
                      <div className="form-grid-address">
                        <Input
                          id="billing-pincode"
                          label="Pincode *"
                          value={billingAddress.pincode}
                          onChange={(e) => setBillingAddress((b) => ({ ...b, pincode: e.target.value }))}
                          error={fieldErrors.billingPincode}
                        />
                        <Input
                          id="billing-city"
                          label="City *"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress((b) => ({ ...b, city: e.target.value }))}
                          error={fieldErrors.billingCity}
                        />
                        <Select
                          id="billing-state"
                          label="State *"
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress((b) => ({ ...b, state: e.target.value }))}
                          options={INDIAN_STATE_OPTIONS}
                          error={fieldErrors.billingState}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Badges & Security Indicators */}
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "var(--radius-md)",
                    padding: "0.875rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    gap: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#374151", fontWeight: 600 }}>
                    <Lock size={14} style={{ color: "#059669" }} /> 256-bit SSL Secure
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#374151", fontWeight: 600 }}>
                    <ShieldCheck size={14} style={{ color: "#059669" }} /> 100% Quality Assured
                  </div>
                </div>

                {checkoutError && (
                  <div role="alert" style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--color-error)", marginTop: "0.5rem" }}>
                    {checkoutError}
                  </div>
                )}

                <Button type="submit" variant="primary" size="lg" loading={checkoutLoading} style={{ width: "100%" }}>
                  Review Order →
                </Button>
              </form>
            )}

            {/* ========================================================
                STAGE 3: ORDER REVIEW AND CONFIRMATION
               ======================================================== */}
            {currentStage === 3 && (
              <div className="checkout-card-form">
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <CheckCircle2 size={20} style={{ color: "var(--color-accent)" }} /> Review Your Order
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                    Please review your shipping details, order items, and payment method before completing your purchase.
                  </p>
                </div>

                {/* Shipping & Contact Summary Card */}
                <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "1.25rem", background: "#FBFAF6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Shipping & Contact Details
                    </span>
                    <button
                      onClick={() => {
                        setCurrentStage(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{ background: "none", border: "none", color: "var(--color-accent)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-primary)" }}>{customer.name}</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
                    {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)", marginTop: "0.5rem" }}>
                    📱 {customer.phone} | ✉️ {customer.email}
                  </p>
                  {deliveryNotes.trim() && (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-accent)", marginTop: "0.5rem", fontWeight: 600 }}>
                      📝 Instructions: {deliveryNotes}
                    </p>
                  )}
                </div>

                {/* Payment Method Summary Card */}
                <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "1.25rem", background: "#FBFAF6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Payment Method
                    </span>
                    <button
                      onClick={() => {
                        setCurrentStage(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{ background: "none", border: "none", color: "var(--color-accent)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-primary)" }}>
                    {paymentMethod === "online" ? "💳 Online Payment (Razorpay — UPI, Cards, NetBanking)" : "💵 Cash on Delivery (COD)"}
                  </p>
                </div>

                {/* Action CTA Buttons */}
                {checkoutError && (
                  <div role="alert" style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--color-error)" }}>
                    {checkoutError}
                  </div>
                )}

                {paymentMethod === "online" ? (
                  checkoutResponse ? (
                    <RazorpayButton
                      checkoutData={checkoutResponse}
                      customerName={customer.name}
                      customerEmail={customer.email}
                      customerPhone={customer.phone}
                      cartItems={items}
                      onSuccess={handlePaymentSuccess}
                      onDismiss={() => setCheckoutResponse(null)}
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="accent"
                      size="lg"
                      loading={checkoutLoading}
                      style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
                      onClick={async () => {
                        await createCheckoutOrder();
                      }}
                    >
                      Proceed to Online Payment — {formatPrice(calculatedTotal)}
                    </Button>
                  )
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    loading={checkoutLoading}
                    style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
                    onClick={async () => {
                      let resp = checkoutResponse;
                      if (!resp) {
                        resp = await createCheckoutOrder();
                      }
                      if (resp) {
                        handlePaymentSuccess(resp.orderNumber, resp.trackingToken);
                      }
                    }}
                  >
                    Place Order (COD) — {formatPrice(calculatedTotal)}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary Box */}
          <div>
            <div
              className="checkout-card-form"
              style={{
                position: "sticky",
                top: "6rem",
              }}
            >
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>
                Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
              </h3>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "280px", overflowY: "auto", paddingRight: "0.25rem", marginBottom: "1.25rem" }}>
                {items.map((item) => (
                  <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <div style={{ position: "relative", width: "52px", height: "52px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border)", flexShrink: 0 }}>
                      <Image src={item.imageUrl || "/images/origin_story.png"} alt={item.name} fill sizes="52px" style={{ objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                        Qty: {item.quantity} × {formatPrice(item.price ?? (item as any).unitPrice ?? 0)}
                      </p>
                    </div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary)" }}>
                      {formatPrice((item.price ?? (item as any).unitPrice ?? 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ height: "1px", background: "var(--color-border)", margin: "1rem 0" }} />

              {/* Price Calculation Table */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted)" }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(rawSubtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted)" }}>
                  <span>Delivery Fee</span>
                  <span style={{ fontWeight: calculatedShipping === null ? 500 : 700 }}>
                    {calculatedShipping === null
                      ? "Calculated at next step"
                      : formatPrice(calculatedShipping)}
                  </span>
                </div>
                {calculatedTax > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted)" }}>
                    <span>Estimated Tax</span>
                    <span>{formatPrice(calculatedTax)}</span>
                  </div>
                )}
                <div style={{ height: "1px", background: "var(--color-border)", margin: "0.5rem 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-primary)" }}>
                  <span>Total Amount</span>
                  <span style={{ color: "var(--color-accent)" }}>{formatPrice(calculatedTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
