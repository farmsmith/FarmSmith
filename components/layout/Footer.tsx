"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

function InstagramIcon({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const SHOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/why-us", label: "Our Standards" },
  { href: "/about-us", label: "Our Story" },
  { href: "/account", label: "My Account" },
];

const HELP_LINKS = [
  { href: "/account/orders", label: "My Orders" },
  { href: "/track", label: "Track Order" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      role="contentinfo"
      style={{
        background: "var(--color-primary)",
        color: "var(--color-card)",
        paddingBlock: "4rem 2rem",
      }}
    >
      <style>{`
        .footer-link {
          font-family: var(--font-subheading);
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(251,250,246,0.75);
          text-decoration: none;
          transition: color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }
        .footer-link:hover {
          color: rgba(251,250,246,1);
        }
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.75rem 1rem;
          width: 100%;
        }
        .footer-connect-col {
          grid-column: 1 / -1;
        }
        @media (min-width: 640px) {
          .footer-links-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2.5rem;
          }
          .footer-connect-col {
            grid-column: auto;
          }
        }
      `}</style>
      <div className="container">
        {/* Main Content Layout */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "3rem",
            marginBottom: "3.5rem",
          }}
        >
          {/* Left Side: FarmSmith Brand & Manifesto */}
          <div style={{ flex: "1 1 360px", maxWidth: "480px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <Image
                src="/images/farmsmith_logo_v2.png"
                alt="FarmSmith Foods"
                width={44}
                height={44}
                unoptimized
                style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-serif-brand)",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  color: "var(--color-card)",
                  letterSpacing: "0.02em",
                }}
              >
                FarmSmith Foods
              </span>
            </div>

            {/* Replaced Manifesto Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                fontSize: "0.9375rem",
                lineHeight: 1.7,
                color: "rgba(251,250,246,0.85)",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
              }}
            >
              <p style={{ margin: 0 }}>
                In a world where it can be difficult to know where our food comes from and how it has been handled, we want to make those answers easier to find.
              </p>
              <p style={{ margin: 0 }}>
                FarmSmith is our small step towards a more transparent food system — thoughtfully sourced, carefully selected and honest about what we know.
              </p>
              <p style={{ margin: 0, color: "rgba(251,250,246,0.92)" }}>
                With every purchase, you help us build a food brand that values people, provenance and the world that sustains us.
              </p>
            </div>
          </div>

          {/* Right Side: Link Columns */}
          <div style={{ flex: "1 1 auto", maxWidth: "540px" }}>
            <div className="footer-links-grid">
              {/* Column 1: Explore */}
              <div>
                <h3
                  onClick={() => {
                    if (window.location.pathname === "/") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  style={{
                    fontFamily: "var(--font-subheading)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    marginBottom: "1rem",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  Explore
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                  }}
                >
                  {SHOP_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="footer-link"
                        onClick={(e) => {
                          if (link.href === "/" && window.location.pathname === "/") {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Help */}
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-subheading)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    marginBottom: "1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Help
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                  }}
                >
                  {HELP_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Contact & Social */}
              <div className="footer-connect-col">
                <h3
                  style={{
                    fontFamily: "var(--font-subheading)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    marginBottom: "1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Connect
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <li>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "rgba(251,250,246,0.8)", lineHeight: 1.5, fontFamily: "var(--font-body)", fontWeight: 400 }}>
                      <MapPin size={16} style={{ marginTop: "3px", color: "var(--color-accent)", flexShrink: 0 }} />
                      <div style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                        <strong style={{ display: "block", color: "var(--color-card)", marginBottom: "0.15rem", fontFamily: "var(--font-subheading)", fontWeight: 500 }}>FARMSMITH</strong>
                        <span>
                          Plot No. 458, Bijayachandrapur,<br />
                          Paradeep, Jagatsinghpur,<br />
                          Odisha – 754120
                        </span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/farmsmithfoods/#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      <InstagramIcon size={16} style={{ color: "var(--color-accent)" }} />
                      <span>farmsmithfoods</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid rgba(251,250,246,0.12)",
            paddingTop: "1.75rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "rgba(251,250,246,0.5)", margin: 0, fontFamily: "var(--font-body)", fontWeight: 400 }}>
            © {new Date().getFullYear()} FARMSMITH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
