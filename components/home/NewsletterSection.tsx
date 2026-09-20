"use client";
import React, { useState, useEffect, useRef } from "react";
import { Heart, Send, CheckCircle2 } from "lucide-react";

import { FieldError } from "@/components/ui/FieldError";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [isAssembled, setIsAssembled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAssembled(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);
    setSubscribed(true);
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: "var(--color-primary-dark)",
        color: "#FFFFFF",
        paddingBlock: "5.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes heartbeatPulse {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.22); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          70% { transform: scale(1); }
        }
        @keyframes haloRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes goldBeamSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Rotating Conic Gradient Halo Portal */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(217, 164, 65, 0) 0deg, rgba(217, 164, 65, 0.18) 180deg, rgba(5, 150, 105, 0.15) 270deg, rgba(217, 164, 65, 0) 360deg)",
          filter: "blur(50px)",
          pointerEvents: "none",
          opacity: isAssembled ? 1 : 0,
          animation: isAssembled ? "haloRotate 20s linear infinite" : "none",
          transition: "opacity 1.5s ease",
        }}
      />

      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", paddingInline: "1rem", textAlign: "center", position: "relative", zIndex: 2 }}>
        {/* Holographic Expanding Iris Glassmorphism Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
            border: "1.5px solid rgba(217, 164, 65, 0.35)",
            borderRadius: "var(--radius-xl, 24px)",
            padding: "clamp(2rem, 5vw, 3.75rem)",
            boxShadow: isAssembled
              ? "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
              : "0 8px 20px rgba(0,0,0,0.15)",
            backdropFilter: "blur(14px)",
            opacity: isAssembled ? 1 : 0,
            transform: isAssembled ? "scale(1)" : "scale(0.86)",
            clipPath: isAssembled
              ? "inset(0% 0% round 24px)"
              : "inset(20% 15% round 32px)",
            transition:
              "transform 2.75s cubic-bezier(0.16, 1, 0.3, 1), clip-path 2.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.75s ease, box-shadow 2.75s ease",
          }}
        >
          {/* Animated Heartbeat Icon */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "rgba(217, 164, 65, 0.15)",
              border: "1px solid rgba(217, 164, 65, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              color: "#D9A441",
              boxShadow: "0 0 20px rgba(217, 164, 65, 0.25)",
              animation: isAssembled ? "heartbeatPulse 2.8s ease-in-out infinite" : "none",
            }}
          >
            <Heart size={26} fill="rgba(217, 164, 65, 0.25)" />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.65rem, 3.8vw, 2.35rem)",
              color: "#FFFFFF",
              marginBottom: "0.75rem",
              letterSpacing: "-0.01em",
            }}
          >
            Join the <span style={{ color: "#D9A441" }}>FarmSmith Family</span>
          </h2>

          <p style={{ color: "rgba(251, 250, 246, 0.85)", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "2rem", maxWidth: "520px", marginInline: "auto" }}>
            Subscribe for fresh batch release alerts, lab report updates, and traditional organic recipes straight to your inbox.
          </p>

          {subscribed ? (
            <div
              role="status"
              aria-live="polite"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(5, 150, 105, 0.2)",
                border: "1px solid #059669",
                color: "#6EE7B7",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9375rem",
              }}
            >
              <CheckCircle2 size={18} aria-hidden="true" /> Thank you for subscribing to FarmSmith Journal!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", width: "100%", flexWrap: "wrap" }}>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your email address..."
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "newsletter-email-error" : undefined}
                  style={{
                    flex: "1 1 240px",
                    height: "3.25rem",
                    paddingInline: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: error ? "1.5px solid #EF4444" : "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(0, 0, 0, 0.35)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #E2B356 0%, #D9A441 100%)",
                    color: "#12241C",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    paddingInline: "1.75rem",
                    height: "3.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 18px rgba(217, 164, 65, 0.35)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle Light Beam Sweep on Button */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      transform: "translateX(-100%)",
                      animation: "goldBeamSweep 4s infinite",
                    }}
                  />
                  <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                    Subscribe <Send size={16} />
                  </span>
                </button>
              </div>
              <FieldError id="newsletter-email-error" message={error} className="text-[#FCA5A5] self-start" />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
