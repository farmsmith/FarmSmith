"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import TrustTicker from "@/components/home/TrustTicker";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function HomeHeroSection() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home-hero-section"
      aria-label="Hero"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "calc(100dvh - 4.25rem)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        paddingTop: "2.5rem",
      }}
    >
      {/* Background Image */}
      <Image
        src="/images/hero_groceries.png"
        alt="Fresh organic groceries, spices, pulses, and wholesome farm produce"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center 60%" }}
      />

      {/* Ambient Dark Gradient Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(23, 45, 35, 0.94) 0%, rgba(31, 58, 46, 0.75) 55%, rgba(31, 58, 46, 0.45) 100%)",
        }}
      />

      {/* Hero Content with Scroll-Triggered Reveal Animation (2.75s) */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1150px",
          margin: "0 auto",
          paddingInline: "1rem",
          flex: 1,
          display: "flex",
          alignItems: "center",
          paddingBottom: "2rem",
          opacity: isHeroVisible ? 1 : 0,
          transform: isHeroVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
          filter: isHeroVisible ? "blur(0px)" : "blur(8px)",
          transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          {/* Trust Eyebrow */}
          <div
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "#D9A441",
              letterSpacing: "0.08em",
              marginBottom: "1rem",
              opacity: isHeroVisible ? 1 : 0,
              transform: isHeroVisible ? "translateX(0)" : "translateX(-30px)",
              transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          >
            SINGLE ORIGIN &bull; BATCH TESTED &bull; TRACEABLE
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif-brand)",
              fontSize: "clamp(2.35rem, 5.2vw, 4rem)",
              fontWeight: 700,
              color: "#FBFAF6",
              marginBottom: "1.25rem",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              opacity: isHeroVisible ? 1 : 0,
              transform: isHeroVisible ? "translateY(0)" : "translateY(25px)",
              transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
            }}
          >
            Food crafted with{" "}
            <span style={{ color: "#D9A441", fontStyle: "normal" }}>
              a mother&apos;s care
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.7,
              color: "rgba(251, 250, 246, 0.9)",
              marginBottom: "2.5rem",
              maxWidth: "560px",
              opacity: isHeroVisible ? 1 : 0,
              transform: isHeroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          >
            Carefully sourced foods from where they grow best, Batch Tested for quality and made easier to trust — one batch at a time.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              opacity: isHeroVisible ? 1 : 0,
              transform: isHeroVisible ? "translateY(0)" : "translateY(15px)",
              transition: "all 2.75s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
            }}
          >
            <Link
              href="/#featured-harvest"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                background: "#D9A441",
                color: "#1F3A2E",
                padding: "0.9375rem 2.25rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(217, 164, 65, 0.3)",
                transition: "transform 0.15s ease, background 0.15s ease",
              }}
            >
              Explore the Shop <ArrowRight size={18} />
            </Link>

            <Link
              href={isLoggedIn ? "/account/orders" : "/track"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1.5px solid rgba(251, 250, 246, 0.5)",
                color: "#FBFAF6",
                padding: "0.9375rem 2rem",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                backdropFilter: "blur(4px)",
                transition: "background 0.15s ease",
              }}
            >
              {isLoggedIn ? (
                <>
                  <Package size={17} /> My Orders
                </>
              ) : (
                "Track Your Order"
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ───── 2. TRUST TICKER MARQUEE (Integrated at bottom of Hero) ───── */}
      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
        <TrustTicker />
      </div>
    </section>
  );
}
