import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read FarmSmith Foods terms and conditions regarding website usage, product ordering, delivery, and customer account policies.",
};

export default function TermsPage() {
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
            Legal Agreement
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
            Terms & Conditions
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
            Please read these terms carefully before placing an order or using FarmSmith services.
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
            1. Introduction & Acceptance
          </h2>
          <p>
            Welcome to FarmSmith Foods ("FarmSmith", "we", "us"). By accessing our website, placing an order, or creating an account, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            2. Product Quality & Sourcing Integrity
          </h2>
          <p>
            FarmSmith is committed to providing 100% pure, GI-tagged Kandhamal turmeric and authentic organic produce. Every batch undergoes third-party lab testing to ensure zero synthetic dyes, zero lead chromate, and no artificial bleaching or flow agents.
          </p>
          <p>
            Natural variation in color or texture may occur between harvests due to authentic organic farming without artificial standardization.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            3. Pricing & Orders
          </h2>
          <p>
            All prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise noted. We reserve the right to modify prices or correct typographical errors. Order acceptance is subject to inventory availability and payment verification.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            4. Shipping & Delivery
          </h2>
          <p>
            Orders are packed with care and handed over to our courier partners. Estimated delivery timelines are provided during checkout. FarmSmith is not liable for delivery delays caused by courier logistics, natural disruptions, or incorrect delivery addresses provided by the buyer.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            5. Customer Account Responsibilities
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your account login credentials and for all activities occurring under your account. Please notify us immediately if you suspect unauthorized account access.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            6. Intellectual Property
          </h2>
          <p>
            All content on FarmSmith — including brand name, logo, images, graphics, text, and product formulations — is the intellectual property of FarmSmith Foods and protected under Indian intellectual property laws.
          </p>

          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.375rem", marginTop: "2rem" }}>
            7. Contact Information
          </h2>
          <p>For questions or support regarding these terms, please contact:</p>
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
            <p style={{ margin: 0, fontSize: "0.875rem" }}>Helpline & WhatsApp: <a href="tel:+918296210991" style={{ color: "var(--color-accent)" }}>+91 82962 10991</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
