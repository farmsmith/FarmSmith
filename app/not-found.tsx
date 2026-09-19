import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        textAlign: "center",
        padding: "2rem",
        background: "var(--color-background)",
      }}
    >
      <div style={{ position: "relative", width: "64px", height: "64px" }}>
        <Image
          src="/images/farmsmith_logo_v2.png"
          alt="FarmSmith Foods"
          width={64}
          height={64}
          unoptimized
          style={{ width: "64px", height: "64px", opacity: 0.85, objectFit: "contain" }}
        />
      </div>
      <div>
        <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>404</p>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2.5rem",
            color: "var(--color-primary)",
            marginBottom: "0.75rem",
          }}
        >
          Page not found
        </h1>
        <p style={{ color: "var(--color-muted)", maxWidth: "400px", lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or may have moved. Let's
          get you back to something wholesome.
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-card)",
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          style={{
            border: "1.5px solid var(--color-primary)",
            color: "var(--color-primary)",
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
