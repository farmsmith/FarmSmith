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
  // Animation stages: 'enter' (0-3s) -> 'docking' (3.0s-3.9s) -> 'settled'
  const [stage, setStage] = useState<"enter" | "docking" | "settled">("enter");
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [showSkip, setShowSkip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    setIsMounted(true);

    // Check if already seen in this session
    const seen = sessionStorage.getItem("farmsmith_intro_seen");
    if (seen === "true") {
      setStage("settled");
      onIntroComplete?.();
      return;
    }

    // Reveal skip button after 1s
    const skipTimer = setTimeout(() => setShowSkip(true), 1000);
    timerRef.current.push(skipTimer);

    // Stagger reveal the 5 nav items one by one (0.3s, 0.6s, 0.9s, 1.2s, 1.5s)
    INTRO_NAV_LINKS.forEach((_, idx) => {
      const t = setTimeout(() => {
        setVisibleItems((prev) => Math.max(prev, idx + 1));
      }, 300 + idx * 280);
      timerRef.current.push(t);
    });

    // At exactly 3.0 seconds, begin the smooth docking/shrink animation
    const dockTimer = setTimeout(() => {
      triggerDocking();
    }, 3200);
    timerRef.current.push(dockTimer);

    // Fast-forward on user scroll
    const handleScroll = () => {
      if (window.scrollY > 20) {
        triggerDocking();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      timerRef.current.forEach(clearTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const triggerDocking = () => {
    setStage("docking");
    sessionStorage.setItem("farmsmith_intro_seen", "true");

    // After docking transition finishes (~800ms), transition to settled
    const settledTimer = setTimeout(() => {
      setStage("settled");
      onIntroComplete?.();
    }, 850);
    timerRef.current.push(settledTimer);
  };

  if (!isMounted || stage === "settled") return null;

  const isDocking = stage === "docking";

  return (
    <div
      aria-label="Welcome Introduction"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: isDocking ? "none" : "auto",
        transition: "opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: isDocking ? 0 : 1,
        background: isDocking
          ? "transparent"
          : "linear-gradient(135deg, rgba(23, 45, 35, 0.96) 0%, rgba(31, 58, 46, 0.88) 50%, rgba(22, 45, 33, 0.94) 100%)",
        backdropFilter: isDocking ? "none" : "blur(8px)",
        WebkitBackdropFilter: isDocking ? "none" : "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background Ambient Glows */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20%",
          left: "15%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,164,65,0.18) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          transition: "opacity 0.8s ease",
          opacity: isDocking ? 0 : 1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,164,65,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          transition: "opacity 0.8s ease",
          opacity: isDocking ? 0 : 1,
        }}
      />

      {/* Main Intro Showcase Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1150px",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "3rem",
          position: "relative",
          zIndex: 2,
        }}
        className="intro-showcase-container"
      >
        {/* ───── LEFT: Big Logo Showcase ───── */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            transition:
              "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isDocking
              ? "translate(-38vw, -42vh) scale(0.32)"
              : "translate(0, 0) scale(1)",
            opacity: isDocking ? 0.2 : 1,
          }}
          className="intro-left-logo-panel"
        >
          {/* Circular Big Logo Container with TM badge */}
          <div
            style={{
              position: "relative",
              width: "clamp(130px, 18vw, 175px)",
              height: "clamp(130px, 18vw, 175px)",
              borderRadius: "50%",
              background: "#FFFFFF",
              padding: "6px",
              border: "3.5px solid #D9A441",
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.45), 0 0 40px rgba(217, 164, 65, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "introLogoPop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <Image
              src="/images/farmsmith_logo_v2.png"
              alt="FarmSmith Foods"
              width={165}
              height={165}
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
                bottom: "4px",
                right: "4px",
                background: "#162D21",
                color: "#D9A441",
                border: "1.5px solid #D9A441",
                fontSize: "clamp(0.65rem, 1vw, 0.8rem)",
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: "100px",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.4)",
                lineHeight: 1.2,
                letterSpacing: "0.04em",
                userSelect: "none",
              }}
            >
              TM
            </span>
          </div>

          {/* Brand Name Typography underneath logo */}
          <div
            style={{
              marginTop: "1.5rem",
              animation: "introFadeIn 0.8s ease 0.3s forwards",
              opacity: 0,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif-brand)",
                fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
                fontWeight: 700,
                color: "#FBFAF6",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              FarmSmith
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#D9A441",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: "0.35rem 0 0",
              }}
            >
              Single Origin &bull; Batch Tested
            </p>
          </div>
        </div>

        {/* Vertical Divider Line (Desktop) */}
        <div
          aria-hidden="true"
          style={{
            width: "1px",
            height: "280px",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(217, 164, 65, 0.5) 50%, transparent 100%)",
            opacity: isDocking ? 0 : 0.7,
            transition: "opacity 0.5s ease",
          }}
          className="intro-divider"
        />

        {/* ───── RIGHT: Staggered Navbar Pages Showcase ───── */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: "1.5rem",
            transition:
              "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isDocking
              ? "translate(10vw, -45vh) scale(0.4)"
              : "translate(0, 0) scale(1)",
            opacity: isDocking ? 0.15 : 1,
          }}
          className="intro-right-nav-panel"
        >
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#D9A441",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            Explore FarmSmith
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              width: "100%",
              maxWidth: "380px",
            }}
          >
            {INTRO_NAV_LINKS.map((item, index) => {
              const isItemVisible = visibleItems > index;
              return (
                <div
                  key={item.label}
                  onClick={() => triggerDocking()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    padding: "0.6rem 1rem",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(217, 164, 65, 0.2)",
                    backdropFilter: "blur(6px)",
                    transition:
                      "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    opacity: isItemVisible ? 1 : 0,
                    transform: isItemVisible
                      ? "translateX(0)"
                      : "translateX(40px)",
                    cursor: "pointer",
                  }}
                  className="intro-nav-card"
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif-brand)",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#D9A441",
                      opacity: 0.85,
                      minWidth: "24px",
                    }}
                  >
                    0{index + 1}
                  </span>

                  <span
                    style={{
                      fontFamily: "var(--font-serif-brand)",
                      fontSize: "clamp(1.25rem, 2.2vw, 1.65rem)",
                      fontWeight: 600,
                      color: "#FBFAF6",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      marginLeft: "auto",
                      color: "#D9A441",
                      fontSize: "1.1rem",
                      opacity: 0.6,
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
      {showSkip && !isDocking && (
        <button
          onClick={triggerDocking}
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "2rem",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(217, 164, 65, 0.4)",
            color: "#FBFAF6",
            padding: "0.55rem 1.25rem",
            borderRadius: "100px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(217, 164, 65, 0.25)";
            e.currentTarget.style.borderColor = "#D9A441";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(217, 164, 65, 0.4)";
          }}
        >
          <span>Skip</span>
          <span style={{ color: "#D9A441" }}>&rarr;</span>
        </button>
      )}

      {/* Inline styles for responsive layout & micro-animations */}
      <style jsx global>{`
        @keyframes introLogoPop {
          0% {
            transform: scale(0.65);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes introFadeIn {
          0% {
            transform: translateY(12px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .intro-nav-card:hover {
          background: rgba(217, 164, 65, 0.15) !important;
          border-color: #D9A441 !important;
          transform: translateX(6px) !important;
        }

        .intro-nav-card:hover .intro-nav-arrow {
          transform: translateX(4px);
          opacity: 1 !important;
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
