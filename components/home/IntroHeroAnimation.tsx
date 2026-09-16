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
  // Animation stages: 'enter' (0-3s) -> 'flying' (3s-4.8s, logo-only slow flight) -> 'settled'
  const [stage, setStage] = useState<"enter" | "flying" | "settled">("enter");
  const [showSkip, setShowSkip] = useState(false);
  
  // Dynamic transform for the big logo's exact flight
  const [logoTransform, setLogoTransform] = useState<string>("translate3d(0, 0, 0) scale(1)");

  const bigLogoRef = useRef<HTMLDivElement>(null);
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

    // Reveal skip button after 0.8s
    const skipTimer = setTimeout(() => setShowSkip(true), 800);
    timerRef.current.push(skipTimer);

    // At 3.0s, initiate the exact flight of the logo
    const dockTimer = setTimeout(() => {
      startFlight();
    }, 3000);
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
    document.documentElement.classList.add("farmsmith-intro-hidden");
    setStage("settled");
    onIntroComplete?.();
  };

  const startFlight = () => {
    sessionStorage.setItem("farmsmith_intro_seen", "true");

    // Calculate exact flight coordinates to Navbar logo (#nav-brand-logo)
    const navLogoEl = document.getElementById("nav-brand-logo");
    const bigLogoEl = bigLogoRef.current;

    if (navLogoEl && bigLogoEl) {
      const targetRect = navLogoEl.getBoundingClientRect();
      const currentRect = bigLogoEl.getBoundingClientRect();

      const deltaX = targetRect.left - currentRect.left;
      const deltaY = targetRect.top - currentRect.top;
      const scale = targetRect.width / currentRect.width;

      setLogoTransform(`translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`);
    } else {
      setLogoTransform("translate3d(calc(-50vw + 60px), calc(-50vh + 35px), 0) scale(0.26)");
    }

    setStage("flying");

    // Flight takes 1.8s
    const settledTimer = setTimeout(() => {
      document.documentElement.classList.add("farmsmith-intro-hidden");
      setStage("settled");
      onIntroComplete?.();
    }, 1850);
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
      {/* ───── 1. Dark Backdrop (Fades out smoothly over 1.8s while logo flies) ───── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#162D21",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(31, 58, 46, 0.98) 0%, rgba(22, 45, 33, 0.98) 70%, rgba(16, 32, 24, 0.98) 100%)",
          transition: "opacity 1.8s cubic-bezier(0.25, 1, 0.35, 1)",
          opacity: isFlying ? 0 : 1,
          zIndex: 1,
        }}
      />

      {/* Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20%",
          left: "15%",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,164,65,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          transition: "opacity 1.2s ease",
          opacity: isFlying ? 0 : 1,
          zIndex: 1,
        }}
      />

      {/* ───── 2. Main Intro Container ───── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          padding: "2rem 2rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "4rem",
          position: "relative",
          zIndex: 2,
        }}
        className="intro-showcase-container"
      >
        {/* ───── LEFT: Big Logo (ONLY THIS ELEMENT FLIES TO NAVBAR) ───── */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
          className="intro-left-logo-panel"
        >
          {/* Circular Big Logo Container with TM badge — FLIES TO NAVBAR */}
          <div
            ref={bigLogoRef}
            style={{
              position: "relative",
              width: "clamp(140px, 18vw, 175px)",
              height: "clamp(140px, 18vw, 175px)",
              borderRadius: "50%",
              background: "#FFFFFF",
              padding: "5px",
              border: isFlying ? "1.5px solid #D9A441" : "2.5px solid #D9A441",
              boxShadow: isFlying
                ? "0 2px 8px rgba(0, 0, 0, 0.25)"
                : "0 16px 40px rgba(0, 0, 0, 0.35), 0 0 35px rgba(217, 164, 65, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: !isFlying ? "introLogoPop 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
              transition:
                "transform 1.8s cubic-bezier(0.25, 1, 0.35, 1), box-shadow 1.8s ease, border-width 1.8s ease",
              transform: logoTransform,
              transformOrigin: "top left",
              zIndex: 100,
              opacity: 1, // Remains 100% visible throughout flight!
            }}
          >
            <Image
              src="/images/farmsmith_logo_v2.png"
              alt="FarmSmith Foods"
              width={170}
              height={170}
              priority
              unoptimized
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            {/* Gold TM Badge */}
            <span
              style={{
                position: "absolute",
                bottom: "3px",
                right: "3px",
                background: "#162D21",
                color: "#D9A441",
                border: "1px solid #D9A441",
                fontSize: "clamp(0.6rem, 0.9vw, 0.72rem)",
                fontWeight: 700,
                padding: "1.5px 6px",
                borderRadius: "100px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
                lineHeight: 1.2,
                letterSpacing: "0.03em",
                userSelect: "none",
              }}
            >
              TM
            </span>
          </div>

          {/* Refined Brand Name underneath logo (fades out in place) */}
          <div
            style={{
              marginTop: "1.25rem",
              animation: "introFadeIn 0.8s ease 0.2s forwards",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              opacity: isFlying ? 0 : 1,
              transform: isFlying ? "translateY(10px)" : "translateY(0)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif-brand)",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 500, // Light & refined, not overly bold
                color: "#FBFAF6",
                margin: 0,
                letterSpacing: "0.03em",
              }}
            >
              FarmSmith
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#D9A441",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                margin: "0.3rem 0 0",
                opacity: 0.9,
              }}
            >
              Single Origin &bull; Batch Tested
            </p>
          </div>
        </div>

        {/* Elegant Thin Divider Line (Desktop) */}
        <div
          aria-hidden="true"
          style={{
            width: "1px",
            height: "260px",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(217, 164, 65, 0.35) 50%, transparent 100%)",
            opacity: isFlying ? 0 : 0.6,
            transition: "opacity 0.5s ease",
          }}
          className="intro-divider"
        />

        {/* ───── RIGHT: Staggered Navbar Pages (FADES OUT IN PLACE — NO FLYING) ───── */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: "1rem",
            position: "relative",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            opacity: isFlying ? 0 : 1,
            transform: isFlying ? "translateY(12px)" : "translateY(0)",
          }}
          className="intro-right-nav-panel"
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#D9A441",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: "1rem",
              animation: "introFadeIn 0.6s ease 0.15s forwards",
              opacity: 0.9,
            }}
          >
            Explore FarmSmith
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
              width: "100%",
              maxWidth: "340px",
            }}
          >
            {INTRO_NAV_LINKS.map((item, index) => {
              const animDelay = `${0.2 + index * 0.18}s`;
              return (
                <div
                  key={item.label}
                  onClick={() => startFlight()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.55rem 0.9rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(217, 164, 65, 0.15)",
                    cursor: "pointer",
                    animation: !isFlying
                      ? `introItemSlideIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${animDelay} forwards`
                      : "none",
                    transition: "all 0.25s ease",
                  }}
                  className="intro-nav-card"
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif-brand)",
                      fontSize: "0.85rem",
                      fontWeight: 400,
                      color: "#D9A441",
                      opacity: 0.8,
                      minWidth: "20px",
                    }}
                  >
                    0{index + 1}
                  </span>

                  <span
                    style={{
                      fontFamily: "var(--font-serif-brand)",
                      fontSize: "clamp(1.15rem, 1.8vw, 1.45rem)",
                      fontWeight: 400, // Refined regular weight, not bold
                      color: "#FBFAF6",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      marginLeft: "auto",
                      color: "#D9A441",
                      fontSize: "1rem",
                      opacity: 0.5,
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                    }}
                    className="intro-nav-arrow"
                  >
                    &rarr;
                  </span>
                </div>
              );
            })}
          </div>
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
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(217, 164, 65, 0.3)",
            color: "#FBFAF6",
            padding: "0.5rem 1.15rem",
            borderRadius: "100px",
            fontSize: "0.78rem",
            fontWeight: 500,
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(217, 164, 65, 0.2)";
            e.currentTarget.style.borderColor = "#D9A441";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(217, 164, 65, 0.3)";
          }}
        >
          <span>Skip</span>
          <span style={{ color: "#D9A441" }}>&rarr;</span>
        </button>
      )}

      {/* Inline styles for animations */}
      <style jsx global>{`
        @keyframes introLogoPop {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes introFadeIn {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes introItemSlideIn {
          0% {
            transform: translateX(30px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .intro-nav-card:hover {
          background: rgba(217, 164, 65, 0.15) !important;
          border-color: rgba(217, 164, 65, 0.4) !important;
          transform: translateX(4px) !important;
        }

        .intro-nav-card:hover .intro-nav-arrow {
          transform: translateX(3px);
          opacity: 0.9 !important;
        }

        @media (max-width: 768px) {
          .intro-showcase-container {
            flex-direction: column !important;
            gap: 2rem !important;
            padding: 1.5rem 1rem !important;
            justifyContent: center !important;
          }
          .intro-divider {
            display: none !important;
          }
          .intro-right-nav-panel {
            padding-left: 0 !important;
            align-items: center !important;
            width: 100% !important;
          }
          .intro-right-nav-panel > div {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
