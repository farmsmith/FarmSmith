"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, Package, LogOut } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { cartItemCount } from "@/lib/cart/reducer";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import CartDrawer from "../cart/CartDrawer";
import LanguageSelector from "./LanguageSelector";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Our Product" },
  { href: "/why-us", label: "Why FarmSmith" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { items, isOpen, openDrawer, closeDrawer } = useCart();
  const count = cartItemCount(items);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  };

  // Auto-close both menus whenever the route changes
  useEffect(() => {
    closeAllMenus();
  }, [pathname]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.email || "";
        setUserName(name);
      } else {
        setUserName(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email || "";
        setUserName(name);
      } else {
        setUserName(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const firstInitial = userName?.trim().charAt(0).toUpperCase() || null;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-close mobile menu when resizing to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    closeAllMenus();
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <>
      <style>{`
        .nav-container {
          width: 100%;
          max-width: 100%;
          padding-inline: 1rem;
          position: relative;
        }
        @media (min-width: 768px) {
          .nav-container {
            padding-inline: 2rem;
          }
        }
        .nav-center-links {
          display: none;
          align-items: center;
          gap: 2.25rem;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        @media (min-width: 900px) {
          .nav-center-links {
            display: flex;
          }
          .nav-mobile-toggle,
          .nav-mobile-dropdown {
            display: none !important;
          }
        }
        .nav-link {
          position: relative;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--color-muted);
          transition: color 0.2s ease, font-weight 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
          padding: 0.5rem 0.125rem;
          display: inline-flex;
          align-items: center;
        }
        .nav-link:hover {
          color: var(--color-primary);
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2.5px;
          background: var(--color-accent);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: bottom right;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        .nav-link.active {
          color: var(--color-primary);
          font-weight: 600;
        }
        .nav-link.active::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-left: auto;
        }
        @media (min-width: 480px) {
          .nav-actions {
            gap: 0.625rem;
          }
        }
        @media (min-width: 640px) {
          .nav-actions {
            gap: 1rem;
          }
        }
        @media (max-width: 380px) {
          .nav-brand-text {
            font-size: 1.05rem !important;
          }
        }
        .nav-icon-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          padding: 0.45rem;
          border-radius: var(--radius-md);
          transition: color 0.15s, background-color 0.15s;
          text-decoration: none;
        }
        .nav-icon-link:hover {
          color: var(--color-accent);
          background-color: rgba(31, 58, 46, 0.05);
        }
        .account-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
          transition: background 0.15s;
          cursor: pointer;
        }
        .account-dropdown-item:hover {
          background-color: var(--color-muted-bg);
          color: var(--color-accent);
        }
      `}</style>

      <header
        role="banner"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1000,
          background: menuOpen || scrolled ? "rgba(251, 250, 246, 0.98)" : "var(--color-card)",
          borderBottom: "1px solid var(--color-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "background 0.25s ease, box-shadow 0.25s ease",
          boxShadow: scrolled || menuOpen ? "0 4px 20px -2px rgba(0, 0, 0, 0.08)" : "none",
        }}
      >
        <div className="nav-container">
          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "4.25rem",
            }}
          >
            {/* Left: Logo */}
            <Link
              href="/"
              onClick={closeAllMenus}
              aria-label="FarmSmith Foods — go to home"
              style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}
            >
              <Image
                src="/images/farmsmith_circle_logo.png"
                alt="FarmSmith Foods"
                width={38}
                height={38}
                priority
                style={{ borderRadius: "50%" }}
              />
              <span
                className="notranslate nav-brand-text"
                translate="no"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "1.1875rem",
                  color: "var(--color-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                FarmSmith
              </span>
            </Link>

            {/* Center: Navigation Links */}
            <div className="nav-center-links">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeAllMenus}
                    className={`nav-link ${active ? "active" : ""}`}
                  >
                    {link.label.includes("FarmSmith") ? (
                      <>
                        {link.label.replace("FarmSmith", "")}
                        <span className="notranslate" translate="no">FarmSmith</span>
                      </>
                    ) : (
                      link.label
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions (Language FIRST -> Cart SECOND -> Account THIRD) */}
            <div className="nav-actions">
              {/* 1. Language Selector (Left of Cart) */}
              <LanguageSelector />

              {/* 2. Cart Trolley Button (Middle) */}
              <button
                onClick={() => {
                  closeAllMenus();
                  openDrawer();
                }}
                aria-label={`Open cart — ${count} ${count === 1 ? "item" : "items"}`}
                className="nav-icon-link"
                id="navbar-cart-button"
                style={{
                  position: "relative",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.4rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                }}
              >
                <ShoppingCart size={22} aria-hidden="true" />
                {count > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-4px",
                      background: "#2563EB",
                      color: "#FFFFFF",
                      borderRadius: "50%",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      width: "1.125rem",
                      height: "1.125rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>

              {/* 3. Account Dropdown Button (Right) */}
              <div ref={accountRef} style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    setAccountMenuOpen((prev) => {
                      const next = !prev;
                      if (next) setMenuOpen(false);
                      return next;
                    });
                  }}
                  aria-label="My Account"
                  aria-expanded={accountMenuOpen}
                  className={`nav-icon-link ${isActive("/account") ? "active" : ""}`}
                  title={userName ? `Account (${userName})` : "My Account"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {firstInitial ? (
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        color: "var(--color-card)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                        border: "2px solid var(--color-accent)",
                      }}
                    >
                      {firstInitial}
                    </div>
                  ) : (
                    <User size={20} aria-hidden="true" />
                  )}
                </button>

                {/* Account Floating Dropdown Menu */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    right: 0,
                    background: "#FFFFFF",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                    padding: "0.5rem 0",
                    minWidth: "190px",
                    zIndex: 50,
                    display: accountMenuOpen ? "block" : "none",
                  }}
                >
                  <Link
                    href="/account"
                    onClick={closeAllMenus}
                    className="account-dropdown-item"
                  >
                    <User size={16} aria-hidden="true" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/account/orders"
                    onClick={closeAllMenus}
                    className="account-dropdown-item"
                  >
                    <Package size={16} aria-hidden="true" />
                    <span>My Orders</span>
                  </Link>

                  <div style={{ height: "1px", background: "var(--color-border)", margin: "0.375rem 0" }} />

                  <button
                    onClick={handleSignOut}
                    className="account-dropdown-item"
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      color: "#C0392B",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => {
                  setMenuOpen((prev) => {
                    const next = !prev;
                    if (next) setAccountMenuOpen(false);
                    return next;
                  });
                }}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="nav-icon-link nav-mobile-toggle"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className="nav-mobile-dropdown"
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-card)",
            padding: "1rem 1.25rem",
            display: menuOpen ? "flex" : "none",
            flexDirection: "column",
            gap: "0.375rem",
            maxHeight: "calc(100dvh - 4.25rem)",
            overflowY: "auto",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
          }}
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeAllMenus}
                style={{
                  display: "block",
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.9375rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--color-primary)" : "var(--color-foreground)",
                  background: active ? "rgba(196, 136, 62, 0.1)" : "transparent",
                  borderLeft: active ? "3px solid var(--color-accent)" : "3px solid transparent",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {link.label.includes("FarmSmith") ? (
                  <>
                    {link.label.replace("FarmSmith", "")}
                    <span className="notranslate" translate="no">FarmSmith</span>
                  </>
                ) : (
                  link.label
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={isOpen} onClose={closeDrawer} />
    </>
  );
}
