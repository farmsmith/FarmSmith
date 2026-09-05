import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { UIStateLayout, UIStateVariant } from "@/types/ui-state";

export interface StateContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: UIStateLayout;
  variant?: UIStateVariant;
  ariaLive?: "polite" | "assertive" | "off";
  role?: "status" | "alert" | "region" | "dialog" | "banner";
  children: React.ReactNode;
}

const layoutContainerStyles: Record<UIStateLayout, string> = {
  page: "min-h-[70vh] flex flex-col items-center justify-center p-6 md:p-12 text-center w-full",
  section: "py-12 md:py-16 px-4 md:px-8 flex flex-col items-center justify-center text-center w-full",
  card: "rounded-[var(--radius-lg)] bg-[var(--color-card)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 md:p-8 flex flex-col items-center justify-center text-center w-full",
  inline: "rounded-[var(--radius-md)] border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full text-left",
  compact: "py-6 px-4 flex flex-col items-center justify-center text-center w-full",
};

const inlineVariantStyles: Record<UIStateVariant, { bg: string; border: string }> = {
  default: { bg: "rgba(31, 58, 46, 0.04)", border: "var(--color-border)" },
  info: { bg: "rgba(31, 58, 46, 0.04)", border: "rgba(31, 58, 46, 0.15)" },
  success: { bg: "rgba(46, 125, 50, 0.06)", border: "rgba(46, 125, 50, 0.20)" },
  warning: { bg: "rgba(217, 164, 65, 0.08)", border: "rgba(217, 164, 65, 0.30)" },
  error: { bg: "var(--color-error-bg)", border: "rgba(192, 57, 43, 0.25)" },
  neutral: { bg: "rgba(107, 122, 107, 0.06)", border: "rgba(107, 122, 107, 0.20)" },
};

export function StateContainer({
  layout = "section",
  variant = "default",
  ariaLive,
  role,
  className,
  children,
  style,
  ...props
}: StateContainerProps) {
  // Determine default ARIA role & live region based on variant
  const defaultRole = role || (variant === "error" ? "alert" : "status");
  const defaultAriaLive = ariaLive || (variant === "error" ? "assertive" : "polite");

  const isInline = layout === "inline";
  const inlineTheme = isInline ? inlineVariantStyles[variant] || inlineVariantStyles.default : null;

  return (
    <div
      role={defaultRole}
      aria-live={defaultAriaLive !== "off" ? defaultAriaLive : undefined}
      aria-atomic="true"
      className={cn(
        "transition-all duration-200",
        layoutContainerStyles[layout],
        className
      )}
      style={{
        ...(inlineTheme && {
          background: inlineTheme.bg,
          borderColor: inlineTheme.border,
        }),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
