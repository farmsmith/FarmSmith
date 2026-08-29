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
  { href: "/shop", label: "All Products" },
  { href: "/about-us", label: "About Us" },
  { href: "/why-us", label: "Why FarmSmith" },
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
          font-size: 0.875rem;
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
          {/* Left Side: FarmSmith Brand & Definition */}
          <div style={{ flex: "1 1 320px", maxWidth: "420px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <Image
                src="/images/farmsmith_circle_logo.png"
                alt="FarmSmith Foods"
                width={42}
                height={42}
                style={{ borderRadius: "50%" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "1.375rem",
                  color: "var(--color-card)",
                }}
              >
                FarmSmith Foods
              </span>
            </div>
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "rgba(251,250,246,0.8)", marginBottom: "1.5rem" }}>
              Organic food crafted with a mother's care. We believe you deserve
              to know exactly where your food came from, what happened to it, and
              proof — not promises.
            </p>

            {/* Trust pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["GI-Tagged Origin", "Lab Tested", "100% Pure", "No Additives"].map((label) => (
                <span
                  key={label}
                  style={{
                    border: "1px solid var(--color-accent)",
                    color: "var(--color-accent)",
                    borderRadius: "var(--radius-full)",
                    padding: "0.2rem 0.65rem",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right Side: Link Columns in 1 single row on all screen sizes */}
          <div style={{ flex: "1 1 auto", maxWidth: "540px" }}>
            <div className="footer-links-grid">
              {/* Column 1: Shop */}
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    marginBottom: "1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Shop
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
                      <Link href={link.href} className="footer-link">
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
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
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
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
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
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "rgba(251,250,246,0.8)", lineHeight: 1.5 }}>
                      <MapPin size={16} style={{ marginTop: "3px", color: "var(--color-accent)", flexShrink: 0 }} />
                      <div style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                        <strong style={{ display: "block", color: "var(--color-card)", marginBottom: "0.15rem" }}>FARMSMITH</strong>
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
          <p style={{ fontSize: "0.8125rem", color: "rgba(251,250,246,0.5)", margin: 0 }}>
            © {new Date().getFullYear()} FarmSmith Foods. All rights reserved. &bull;{" "}
            <Link href="/privacy-policy" style={{ color: "rgba(251,250,246,0.7)", textDecoration: "none" }}>Privacy Policy</Link> &bull;{" "}
            <Link href="/terms" style={{ color: "rgba(251,250,246,0.7)", textDecoration: "none" }}>Terms & Conditions</Link>
          </p>
          <p style={{ fontSize: "0.8125rem", color: "rgba(251,250,246,0.4)", margin: 0 }}>
            Made with care in Odisha, India.
          </p>
        </div>
      </div>
    </footer>
  );
}
