"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "var(--color-background)", minHeight: "85vh" }}>
      {/* Hero Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #1C3121 0%, #2A4832 100%)",
          color: "#FBFAF6",
          paddingBlock: "4rem 3.5rem",
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
              marginBottom: "0.75rem",
            }}
          >
            Get In Touch
          </span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              fontWeight: 700,
              marginBottom: "1rem",
              lineHeight: 1.15,
              color: "#FFFFFF",
            }}
          >
            Contact FarmSmith Foods
          </h1>
          <p
            style={{
              color: "rgba(251, 250, 246, 0.85)",
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Have a question about our GI-tagged turmeric, order status, or bulk/B2B inquiries? We're here to help!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container" style={{ paddingBlock: "4rem 5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3.5rem",
            alignItems: "start",
          }}
        >
          {/* Contact Details Card */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                color: "var(--color-primary)",
                marginBottom: "1rem",
              }}
            >
              Reach Out Directly
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Our support team is available Monday through Saturday from 9:00 AM to 6:00 PM IST.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  background: "var(--color-card)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ padding: "0.5rem", borderRadius: "50%", background: "rgba(196,136,62,0.15)", color: "var(--color-accent)" }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-primary)" }}>Email Us</h4>
                  <a href="mailto:farmsmith6@gmail.com" style={{ color: "var(--color-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
                    farmsmith6@gmail.com
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  background: "var(--color-card)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ padding: "0.5rem", borderRadius: "50%", background: "rgba(196,136,62,0.15)", color: "var(--color-accent)" }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-primary)" }}>Customer Helpline & WhatsApp</h4>
                  <a href="tel:+918296210991" style={{ color: "var(--color-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
                    +91 82962 10991
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  background: "var(--color-card)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ padding: "0.5rem", borderRadius: "50%", background: "rgba(196,136,62,0.15)", color: "var(--color-accent)" }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-primary)" }}>Corporate & Registered Office</h4>
                  <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                    FARMSMITH, Plot No. 458, Bijayachandrapur, Paradeep, Jagatsinghpur, Odisha – 754120, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div
            style={{
              background: "var(--color-card)",
              borderRadius: "var(--radius-xl)",
              padding: "2.5rem 2rem",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                color: "var(--color-primary)",
                marginBottom: "1.5rem",
              }}
            >
              Send Us a Message
            </h3>

            {submitted ? (
              <div
                style={{
                  background: "rgba(42, 72, 50, 0.08)",
                  border: "1px solid var(--color-primary)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <CheckCircle2 size={42} style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }} />
                <h4 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", margin: "0 0 0.5rem" }}>
                  Thank you!
                </h4>
                <p style={{ color: "var(--color-muted)", fontSize: "0.9375rem", margin: 0 }}>
                  Your message has been received. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label htmlFor="contact-name" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.375rem" }}>
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.375rem" }}>
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.375rem" }}>
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Product Inquiry / Order Help"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.375rem" }}>
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      fontSize: "0.9375rem",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>

                {errorMessage && (
                  <div
                    style={{
                      background: "rgba(220, 38, 38, 0.1)",
                      border: "1px solid var(--color-error)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "var(--color-error)",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    background: "var(--color-primary)",
                    color: "#FBFAF6",
                    padding: "0.875rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <Send size={18} />
                  <span>{submitting ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
