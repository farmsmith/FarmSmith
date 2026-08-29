import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn about how FarmSmith Foods collects, stores, protects, and handles your personal information, account data, and order details.",
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: "var(--color-background)", minHeight: "85vh" }}>
      {/* Header Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #1C3121 0%, #2A4832 100%)",
          color: "#FBFAF6",
          paddingBlock: "3.5rem 3rem",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: "800px" }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--color-accent)",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Legal & Transparency
          </span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              marginBottom: "0.75rem",
              lineHeight: 1.15,
              color: "#FFFFFF",
            }}
          >
            Privacy Policy
          </h1>
          <p
            style={{
              color: "rgba(251, 250, 246, 0.85)",
              fontSize: "1rem",
              lineHeight: 1.6,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Last updated: August 2026. Your privacy and trust are fundamental to everything we build at FarmSmith.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container" style={{ paddingBlock: "3.5rem 5rem" }}>
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2.5rem 2rem",
            boxShadow: "var(--shadow-card)",
            color: "var(--color-foreground)",
            lineHeight: 1.8,
            fontSize: "0.9375rem",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: 0 }}>
            1. Overview & Sourcing Ethics
          </h2>
          <p>
            At FarmSmith Foods ("FarmSmith", "we", "our", or "us"), we value complete transparency — not only in our GI-tagged turmeric and organic products, but also in how we handle customer personal data. This Privacy Policy explains what information we collect when you visit our website, register an account, or place an order, and how that information is used and protected.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            2. Information We Collect
          </h2>
          <p>We collect information that is strictly necessary to fulfill your orders and manage your customer account:</p>
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li><strong>Account Information:</strong> When you register an account, we store your full name, email address, and mobile number via secure authentication services.</li>
            <li><strong>Order & Delivery Details:</strong> When placing an order, we collect delivery addresses, pin code, contact details, and payment choices (e.g. Cash on Delivery or Razorpay).</li>
            <li><strong>Customer Support Messages:</strong> Inquiries sent through our contact forms or customer helpline (+91 82962 10991) are stored to help resolve your questions effectively.</li>
          </ul>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            3. Authentication Cookies & Local Storage
          </h2>
          <p>
            FarmSmith uses standard authentication cookies (via Supabase Auth) to keep you securely signed in to your profile and order history. We also utilize local browser storage (such as <code>farmsmith_cart_v2</code> and <code>farmsmith_customer_info_v1</code>) so your shopping cart and shipping preferences persist across page reloads.
          </p>
          <p>
            We do not use intrusive third-party advertising cookies or sell user tracking data to external brokers.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            4. Payment Data Security
          </h2>
          <p>
            Online transactions are processed securely through accredited payment gateways (Razorpay) using industry-standard SSL/TLS encryption. FarmSmith never stores or sees your sensitive credit/debit card numbers, UPI PINs, or bank credentials.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            5. Data Protection & Sharing
          </h2>
          <p>
            We strictly do NOT sell, rent, or trade your personal information. Data is shared exclusively with necessary logistics and delivery partners for shipping your orders, or where required by Indian applicable law.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            6. Your Rights & Support
          </h2>
          <p>
            You have the right to view, update, or request deletion of your account details at any time. You can update your profile directly under <a href="/account" style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>My Profile</a> or reach out to us:
          </p>
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              marginTop: "1rem",
            }}
          >
            <p style={{ margin: "0 0 0.25rem", fontWeight: 700, color: "var(--color-primary)" }}>FARMSMITH FOODS</p>
            <p style={{ margin: "0 0 0.25rem", fontSize: "0.875rem" }}>Plot No. 458, Bijayachandrapur, Paradeep, Jagatsinghpur, Odisha – 754120, India</p>
            <p style={{ margin: "0 0 0.25rem", fontSize: "0.875rem" }}>Email: <a href="mailto:farmsmith6@gmail.com" style={{ color: "var(--color-accent)" }}>farmsmith6@gmail.com</a></p>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>Helpline: <a href="tel:+918296210991" style={{ color: "var(--color-accent)" }}>+91 82962 10991</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
