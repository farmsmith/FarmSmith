"use client";

export default function AnnouncementBar() {
  return (
    <div
      style={{
        background: "var(--color-primary-dark)",
        color: "#F4EFE4",
        fontSize: "0.75rem",
        fontWeight: 600,
        textAlign: "center",
        padding: "0.5rem 1rem",
        letterSpacing: "0.03em",
      }}
    >
      🌿 Free shipping on orders above ₹999 · Use code <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>FARMSMITH10</span> for 10% off · GI-Tagged Pure Spices & Oils
    </div>
  );
}
