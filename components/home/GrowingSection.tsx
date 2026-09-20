"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function GrowingSection() {
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

  return (
    <section
      ref={sectionRef}
      style={{
        background: "linear-gradient(140deg, #0A1711 0%, #12281D 45%, #1B3829 100%)",
        color: "#FBFAF6",
        paddingBlock: "5.5rem 6rem",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(217, 164, 65, 0.25)",
        borderBottom: "1px solid rgba(217, 164, 65, 0.25)",
      }}
    >
      {/* Subtle Ambient Radial Glow Behind Right Image Area */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          right: "-5%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(217, 164, 65, 0.16) 0%, rgba(31, 58, 46, 0.12) 50%, rgba(0,0,0,0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          paddingInline: "1.25rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Top 2-Column Section: Text Content Left, Botanical Tree Illustration Right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(2.5rem, 5vw, 4.5rem)",
            alignItems: "center",
          }}
        >
          {/* Text Left - Slides in slowly from Left to Right */}
          <div>
            {/* Pill Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(217, 164, 65, 0.12)",
                border: "1px solid rgba(217, 164, 65, 0.35)",
                padding: "0.45rem 1.1rem",
                borderRadius: "100px",
                marginBottom: "1.25rem",
                backdropFilter: "blur(6px)",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(-75px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
              }}
            >
              <Sparkles size={15} style={{ color: "#D9A441" }} />
              <span
                style={{
                  fontSize: "0.78125rem",
                  fontWeight: 800,
                  color: "#D9A441",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Farmsmith is growing
              </span>
            </div>

            {/* Heading */}
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
                fontWeight: 700,
                color: "#FBFAF6",
                marginBottom: "1.25rem",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(-85px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
              }}
            >
              From one origin <br />
              <span style={{ color: "#D9A441", fontStyle: "normal" }}>to many</span>
            </h2>

            {/* Paragraph */}
            <p
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.75,
                color: "rgba(251, 250, 246, 0.88)",
                marginBottom: "2.25rem",
                maxWidth: "520px",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(-80px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
              }}
            >
              Kandhamal turmeric is where farmsmith begins. We are building a considered range of
              everyday foods, each chosen for its origin, quality and story.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                opacity: isAssembled ? 1 : 0,
                transform: isAssembled ? "translateX(0)" : "translateX(-75px)",
                transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
              }}
            >
              <Link
                href="/#featured-harvest"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  background: "linear-gradient(135deg, #E2B356 0%, #D9A441 100%)",
                  color: "#12241C",
                  padding: "0.9375rem 2.25rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(217, 164, 65, 0.3)",
                  transition: "transform 0.15s ease",
                }}
              >
                Shop Turmeric Today <ArrowRight size={18} />
              </Link>

              <Link
                href="/shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1px solid rgba(217, 164, 65, 0.4)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#FBFAF6",
                  padding: "0.9375rem 2rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  backdropFilter: "blur(4px)",
                }}
              >
                Follow New Releases
              </Link>
            </div>
          </div>

          {/* Right: Botanical Tree Illustration Card (Scaled to align nicely with left content) */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-2xl, 22px)",
              overflow: "hidden",
              background: "#FAF7F0",
              border: "1.5px solid rgba(217, 164, 65, 0.4)",
              boxShadow: isAssembled
                ? "0 20px 50px rgba(0, 0, 0, 0.38), 0 0 25px rgba(217, 164, 65, 0.15)"
                : "0 6px 18px rgba(0, 0, 0, 0.15)",
              maxWidth: "340px",
              width: "100%",
              margin: "0 auto",
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled
                ? "translateX(0) scale(1)"
                : "translateX(80px) scale(0.94)",
              transition:
                "transform 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, box-shadow 2.75s ease",
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", maxHeight: "420px" }}>
              <Image
                src="/images/farmsmith_growing_tree.jpg"
                alt="Everyday grocery staples but cleaner — FarmSmith organic staples growing"
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center center",
                }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Upcoming Teaser Cards (Placed below the split section) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: "3.75rem",
          }}
        >
          {/* Card 1: Cold-Pressed Oils */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(217, 164, 65, 0.3)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem 1.75rem",
              textAlign: "center",
              boxShadow: isAssembled
                ? "0 16px 36px rgba(0, 0, 0, 0.25)"
                : "0 4px 12px rgba(0, 0, 0, 0.1)",
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled
                ? "translateY(0) scale(1)"
                : "translateY(40px) scale(0.95)",
              transition:
                "transform 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, box-shadow 2.75s ease",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                color: "#D9A441",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: "rgba(217, 164, 65, 0.12)",
                padding: "0.25rem 0.65rem",
                borderRadius: "100px",
                display: "inline-block",
                marginBottom: "0.75rem",
              }}
            >
              UPCOMING
            </span>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.3rem",
                color: "#FFFFFF",
                marginBottom: "0.35rem",
                fontWeight: 700,
              }}
            >
              Cold-Pressed Oils
            </h4>
            <p style={{ fontSize: "0.875rem", color: "rgba(251,250,246,0.7)", margin: 0 }}>
              Wood-milled purity
            </p>
          </div>

          {/* Card 2: Grains and pulses */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(217, 164, 65, 0.3)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem 1.75rem",
              textAlign: "center",
              boxShadow: isAssembled
                ? "0 16px 36px rgba(0, 0, 0, 0.25)"
                : "0 4px 12px rgba(0, 0, 0, 0.1)",
              opacity: isAssembled ? 1 : 0,
              transform: isAssembled
                ? "translateY(0) scale(1)"
                : "translateY(40px) scale(0.95)",
              transition:
                "transform 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.25s, opacity 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.25s, box-shadow 2.75s ease",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                color: "#D9A441",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: "rgba(217, 164, 65, 0.12)",
                padding: "0.25rem 0.65rem",
                borderRadius: "100px",
                display: "inline-block",
                marginBottom: "0.75rem",
              }}
            >
              UPCOMING
            </span>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.3rem",
                color: "#FFFFFF",
                marginBottom: "0.35rem",
                fontWeight: 700,
              }}
            >
              Grains and pulses
            </h4>
            <p style={{ fontSize: "0.875rem", color: "rgba(251,250,246,0.7)", margin: 0 }}>
              From where it grows best
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

