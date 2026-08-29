import { cn } from "@/lib/utils/cn";

interface TrustBadgeItem {
  label: string;
  icon?: string; // emoji or text icon
}

interface TrustBadgeProps {
  badges: TrustBadgeItem[];
  className?: string;
  size?: "sm" | "md";
}

/**
 * TrustBadge — renders a row of pill badges driven by data.
 * Adding a new badge requires only a data change, not a component change.
 */
export default function TrustBadge({
  badges,
  className,
  size = "md",
}: TrustBadgeProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="list"
      aria-label="Product certifications"
    >
      {badges.map((badge) => (
        <span
          key={badge.label}
          role="listitem"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            border: "1.5px solid var(--color-accent)",
            color: "var(--color-accent)",
            borderRadius: "var(--radius-full)",
            padding: size === "sm" ? "0.15rem 0.6rem" : "0.25rem 0.875rem",
            fontSize: size === "sm" ? "0.625rem" : "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "rgba(217,164,65,0.08)",
            whiteSpace: "nowrap",
          }}
        >
          {badge.icon && (
            <span aria-hidden="true" style={{ fontSize: "0.75rem" }}>
              {badge.icon}
            </span>
          )}
          {badge.label}
        </span>
      ))}
    </div>
  );
}

// Default trust badges for turmeric — used when product doesn't supply its own
export const TURMERIC_TRUST_BADGES: TrustBadgeItem[] = [
  { label: "100% Pure Turmeric", icon: "✓" },
  { label: "GI-Tagged Origin", icon: "🏷" },
  { label: "Lab Tested", icon: "🔬" },
  { label: "No Additives", icon: "✓" },
];
