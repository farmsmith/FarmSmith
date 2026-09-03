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
      🌿 Farm-Fresh Organic Spices & Oils · Use code <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>FARMSMITH10</span> for 10% off · Delivered Direct from Odisha Farms
    </div>
  );
}
