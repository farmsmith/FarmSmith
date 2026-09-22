"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
}

const INTRO_NAV_LINKS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/#featured-harvest" },
  { label: "Our Standards", href: "/#standards" },
  { label: "Our Story", href: "/about-us" },
  { label: "Contact", href: "/contact" },
];

export default function IntroHeroAnimation({
  onIntroComplete,
}: {
  onIntroComplete?: () => void;
}) {
  // Animation stages: 'enter' (0-2.2s) -> 'flying' (2.2s-5.8s, slow graceful logo + text flight) -> 'settled'
  const [stage, setStage] = useState<"enter" | "flying" | "settled">("enter");
  const [showSkip, setShowSkip] = useState(false);

  // Dynamic transforms for the big logo, FarmSmith text, and 5 navbar pills flight
  const [logoTransform, setLogoTransform] = useState<string>("translate3d(0, 0, 0) scale(1)");
  const [textTransform, setTextTransform] = useState<string>("translate3d(0, 0, 0) scale(1)");
  const [navTransforms, setNavTransforms] = useState<string[]>(
    INTRO_NAV_LINKS.map(() => "translate3d(0, 0, 0) scale(1)")
  );

  const bigLogoRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLHeadingElement>(null);
  const navPillLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Check if already seen in this session (only play on first visit)
    const seen = sessionStorage.getItem("farmsmith_intro_seen");
    if (seen === "true") {
      document.documentElement.classList.add("farmsmith-intro-hidden");
      setStage("settled");
      onIntroComplete?.();
      return;
    }

    // Reveal skip button after 0.6s
    const skipTimer = setTimeout(() => setShowSkip(true), 600);
    timerRef.current.push(skipTimer);

    // At 2.2s, initiate the slow, majestic logo, text, and navbar pages flight
    const dockTimer = setTimeout(() => {
      startFlight();
    }, 2200);
    timerRef.current.push(dockTimer);

    // If user starts scrolling down, immediately dismiss intro completely
    const handleScroll = () => {
      if (window.scrollY > 10) {
        dismissImmediately();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      timerRef.current.forEach(clearTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const dismissImmediately = () => {
    sessionStorage.setItem("farmsmith_intro_seen", "true");
    document.documentElement.classList.add("farmsmith-hero-fadein");
    document.documentElement.classList.add("farmsmith-intro-hidden");
    setStage("settled");
    onIntroComplete?.();
  };

  const startFlight = () => {
    sessionStorage.setItem("farmsmith_intro_seen", "true");
    document.documentElement.classList.add("farmsmith-hero-fadein");

    // 1. Calculate exact center-to-center flight coordinates for Logo to Navbar logo (#nav-brand-logo)
    const navLogoEl = document.getElementById("nav-brand-logo");
    const bigLogoEl = bigLogoRef.current;

    if (navLogoEl && bigLogoEl) {
      const targetRect = navLogoEl.getBoundingClientRect();
      const currentRect = bigLogoEl.getBoundingClientRect();

      const currentCenterX = currentRect.left + currentRect.width / 2;
      const currentCenterY = currentRect.top + currentRect.height / 2;
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      const deltaX = targetCenterX - currentCenterX;
      const deltaY = targetCenterY - currentCenterY;
      const scale = targetRect.width / currentRect.width;

      setLogoTransform(`translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`);
    } else {
      setLogoTransform("translate3d(calc(-50vw + 60px), calc(-50vh + 35px), 0) scale(0.24)");
    }

    // 2. Calculate exact center-to-center flight coordinates for FarmSmith text to Navbar text (#nav-brand-text)
    const navTextEl = document.getElementById("nav-brand-text");
    const brandTextEl = brandTextRef.current;

    if (navTextEl && brandTextEl) {
      const targetTextRect = navTextEl.getBoundingClientRect();
      const currentTextRect = brandTextEl.getBoundingClientRect();

      const currentTextCenterX = currentTextRect.left + currentTextRect.width / 2;
      const currentTextCenterY = currentTextRect.top + currentTextRect.height / 2;
      const targetTextCenterX = targetTextRect.left + targetTextRect.width / 2;
      const targetTextCenterY = targetTextRect.top + targetTextRect.height / 2;

      const textDeltaX = targetTextCenterX - currentTextCenterX;
      const textDeltaY = targetTextCenterY - currentTextCenterY;
      const textScale = targetTextRect.width / currentTextRect.width;

      setTextTransform(`translate3d(${textDeltaX}px, ${textDeltaY}px, 0) scale(${textScale})`);
    } else {
      setTextTransform("translate3d(calc(-50vw + 120px), calc(-50vh + 35px), 0) scale(0.38)");
    }

    // 3. Calculate exact center-to-center flight coordinates for all 5 navbar pages to navbar links (#nav-link-0..4)
    const nextNavTransforms: string[] = [];
    for (let i = 0; i < INTRO_NAV_LINKS.length; i++) {
      const targetLinkEl = document.getElementById(`nav-link-${i}`);
      const labelEl = navPillLabelRefs.current[i];

      if (targetLinkEl && labelEl && targetLinkEl.offsetParent !== null) {
        const targetLinkRect = targetLinkEl.getBoundingClientRect();
        const currentLabelRect = labelEl.getBoundingClientRect();

        const currentLabelCenterX = currentLabelRect.left + currentLabelRect.width / 2;
        const currentLabelCenterY = currentLabelRect.top + currentLabelRect.height / 2;
        const targetLinkCenterX = targetLinkRect.left + targetLinkRect.width / 2;
        const targetLinkCenterY = targetLinkRect.top + targetLinkRect.height / 2;

        const pillDeltaX = targetLinkCenterX - currentLabelCenterX;
        const pillDeltaY = targetLinkCenterY - currentLabelCenterY;
        const pillScale = targetLinkRect.width / currentLabelRect.width;

        nextNavTransforms.push(`translate3d(${pillDeltaX}px, ${pillDeltaY}px, 0) scale(${pillScale})`);
      } else {
        // Fallback for mobile / narrow viewports where center links are hidden
        nextNavTransforms.push("translate3d(0, -35px, 0) scale(0.85)");
      }
    }
    setNavTransforms(nextNavTransforms);

    setStage("flying");

    // Flight takes 2.5s for smooth, graceful docking and hero reveal
    const settledTimer = setTimeout(() => {
      document.documentElement.classList.add("farmsmith-intro-hidden");
      setStage("settled");
      onIntroComplete?.();
    }, 2500);
    timerRef.current.push(settledTimer);
  };

  if (stage === "settled") return null;

  const isFlying = stage === "flying";

  return (
    <div
      id="farmsmith-intro-overlay"
      aria-label="Welcome Introduction"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: isFlying ? "none" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* ───── 1. Crisp White / Light Backdrop (Fades out gently during logo & text flight) ───── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          backgroundImage:
            "linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 100%)",
          transition: "opacity 2.5s cubic-bezier(0.35, 0, 0.25, 1)",
          opacity: isFlying ? 0 : 1,
          zIndex: 1,
        }}
      />

      {/* Soft Ambient Gold/Warm Glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217, 164, 65, 0.12) 0%, rgba(31, 58, 46, 0.05) 50%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          transition: "opacity 1.8s ease",
          opacity: isFlying ? 0 : 1,
          zIndex: 1,
        }}
      />

      {/* ───── 2. Centered Intro Showcase Container ───── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
        className="intro-showcase-container"
      >
        {/* ───── TOP: Big Logo (FLIES SLOWLY ACROSS SCREEN TO NAVBAR LOGO) ───── */}
        <div
          ref={bigLogoRef}
          style={{
            position: "relative",
            width: "clamp(190px, 28vw, 255px)",
            height: "clamp(190px, 28vw, 255px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            boxShadow: "none",
            transform: logoTransform,
            transformOrigin: "center center",
            transition: isFlying
              ? "transform 2.5s cubic-bezier(0.35, 0, 0.2, 1)"
              : "none",
            zIndex: 100,
            opacity: 1,
          }}
        >
          <Image
            src="/images/farmsmith_logo_v2.png"
            alt="FarmSmith Foods"
            width={255}
            height={255}
            priority
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* ───── MIDDLE: Brand Title & Subtitle (FARMSMITH TEXT FLIES TO NAVBAR TEXT) ───── */}
        <div
          style={{
            marginTop: "1.1rem",
            position: "relative",
            zIndex: 100,
          }}
        >
          <h2
            ref={brandTextRef}
            className="notranslate"
            translate="no"
            style={{
              fontFamily: "var(--font-serif-brand)",
              fontSize: "clamp(2.6rem, 5.2vw, 4rem)",
              fontWeight: 700,
              color: "var(--color-primary, #1F3A2E)",
              margin: 0,
              letterSpacing: "0.02em",
              lineHeight: 1.15,
              display: "inline-block",
              whiteSpace: "nowrap",
              transform: textTransform,
              transformOrigin: "center center",
              transition: isFlying
                ? "transform 2.5s cubic-bezier(0.35, 0, 0.2, 1), color 2.5s cubic-bezier(0.35, 0, 0.2, 1)"
                : "none",
              opacity: 1,
            }}
          >
            FarmSmith
          </h2>

          {/* Subtitle (Fades Out Gently In Place) */}
          <p
            style={{
              fontSize: "0.875rem",
              color: "#B37D28",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: "0.4rem 0 0",
              transition: "opacity 1.6s ease, transform 1.6s ease",
              opacity: isFlying ? 0 : 1,
              transform: isFlying ? "translateY(12px)" : "translateY(0)",
              pointerEvents: isFlying ? "none" : "auto",
            }}
          >
            Organic Food Crafted with a Mother's Care
          </p>
        </div>

        {/* ───── BOTTOM: Navbar Pages Down Below the Logo (FLIES TO NAVBAR LINKS) ───── */}
        <div
          style={{
            marginTop: "2.25rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.85rem clamp(1.25rem, 3vw, 2.5rem)",
            width: "100%",
            maxWidth: "850px",
            position: "relative",
            zIndex: 10,
            pointerEvents: isFlying ? "none" : "auto",
          }}
        >
          {INTRO_NAV_LINKS.map((item, index) => {
            return (
              <div
                key={item.label}
                onClick={startFlight}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.4rem 0.6rem",
                  position: "relative",
                  cursor: "pointer",
                  zIndex: 100,
                }}
                className="intro-nav-item"
              >
                {/* Navigation Text Label (FLIES PRECISELY TO THE EXACT NAVBAR LINK) */}
                <span
                  ref={(el) => {
                    navPillLabelRefs.current[index] = el;
                  }}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    fontFamily: "var(--font-body, system-ui)",
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: isFlying
                      ? index === 0
                        ? "var(--color-primary, #1F3A2E)"
                        : "var(--color-muted, #736E65)"
                      : "var(--color-primary, #1F3A2E)",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    transform: navTransforms[index] || "translate3d(0, 0, 0) scale(1)",
                    transformOrigin: "center center",
                    transition: isFlying
                      ? "transform 2.5s cubic-bezier(0.35, 0, 0.2, 1), color 2.5s cubic-bezier(0.35, 0, 0.2, 1)"
                      : "color 0.2s ease",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skip Button (bottom-right) */}
      {showSkip && !isFlying && (
        <button
          onClick={startFlight}
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "2rem",
            background: "rgba(31, 58, 46, 0.05)",
            border: "1px solid rgba(31, 58, 46, 0.15)",
            color: "#1F3A2E",
            padding: "0.5rem 1.15rem",
            borderRadius: "100px",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(217, 164, 65, 0.15)";
            e.currentTarget.style.borderColor = "#D9A441";
            e.currentTarget.style.color = "#1F3A2E";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(31, 58, 46, 0.05)";
            e.currentTarget.style.borderColor = "rgba(31, 58, 46, 0.15)";
            e.currentTarget.style.color = "#1F3A2E";
          }}
        >
          <span>Skip</span>
          <span style={{ color: "#B37D28" }}>&rarr;</span>
        </button>
      )}

      {/* Inline styles */}
      <style jsx global>{`
        .intro-nav-item:hover span {
          color: #B37D28 !important;
        }

        @media (max-width: 768px) {
          .intro-showcase-container {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
