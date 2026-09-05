import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { UIStateVariant } from "@/types/ui-state";

export interface StateIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: UIStateVariant;
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
}

const variantStyles: Record<UIStateVariant, { bg: string; color: string; border: string }> = {
  default: {
    bg: "rgba(31, 58, 46, 0.08)",
    color: "var(--color-primary)",
    border: "rgba(31, 58, 46, 0.15)",
  },
  info: {
    bg: "rgba(31, 58, 46, 0.08)",
    color: "var(--color-primary)",
    border: "rgba(31, 58, 46, 0.15)",
  },
  success: {
    bg: "rgba(46, 125, 50, 0.10)",
    color: "#2E7D32",
    border: "rgba(46, 125, 50, 0.20)",
  },
  warning: {
    bg: "rgba(217, 164, 65, 0.14)",
    color: "#B37E14",
    border: "rgba(217, 164, 65, 0.30)",
  },
  error: {
    bg: "var(--color-error-bg)",
    color: "var(--color-error)",
    border: "rgba(192, 57, 43, 0.25)",
  },
  neutral: {
    bg: "rgba(107, 122, 107, 0.10)",
    color: "var(--color-muted)",
    border: "rgba(107, 122, 107, 0.20)",
  },
};

const sizeStyles = {
  sm: { width: "36px", height: "36px", borderRadius: "var(--radius-md)", iconSize: "18px" },
  md: { width: "48px", height: "48px", borderRadius: "var(--radius-lg)", iconSize: "24px" },
  lg: { width: "64px", height: "64px", borderRadius: "50%", iconSize: "32px" },
  xl: { width: "80px", height: "80px", borderRadius: "50%", iconSize: "40px" },
};

export function StateIcon({
  variant = "default",
  size = "lg",
  className,
  children,
  style,
  ...props
}: StateIconProps) {
  if (!children) return null;

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.lg;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center shrink-0 select-none transition-transform duration-200",
        className
      )}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        borderRadius: currentSize.borderRadius,
        background: currentVariant.bg,
        color: currentVariant.color,
        border: `1px solid ${currentVariant.border}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
