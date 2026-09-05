import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { UIStateAction } from "@/types/ui-state";

export interface StateActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  primaryAction?: UIStateAction;
  secondaryAction?: UIStateAction;
  align?: "center" | "start" | "end";
  children?: React.ReactNode;
}

function renderAction(action: UIStateAction, defaultVariant: "primary" | "outline") {
  const {
    label,
    onClick,
    href,
    variant = defaultVariant,
    loading = false,
    disabled = false,
    icon,
    ariaLabel,
    isExternal = false,
  } = action;

  if (href) {
    return (
      <Link
        key={label}
        href={href}
        aria-label={ariaLabel || label}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={cn(buttonVariants({ variant, size: "md" }), "no-underline")}
      >
        {icon && <span aria-hidden="true" className="shrink-0">{icon}</span>}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Button
      key={label}
      type="button"
      onClick={onClick}
      variant={variant}
      size="md"
      loading={loading}
      disabled={disabled}
      aria-label={ariaLabel || label}
    >
      {icon && !loading && <span aria-hidden="true" className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </Button>
  );
}

export function StateActions({
  primaryAction,
  secondaryAction,
  align = "center",
  className,
  children,
  style,
  ...props
}: StateActionsProps) {
  if (!primaryAction && !secondaryAction && !children) return null;

  const alignClasses = {
    center: "justify-center text-center",
    start: "justify-start text-left",
    end: "justify-end text-right",
  }[align];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 mt-4 w-full",
        alignClasses,
        className
      )}
      style={style}
      {...props}
    >
      {primaryAction && renderAction(primaryAction, "primary")}
      {secondaryAction && renderAction(secondaryAction, "outline")}
      {children}
    </div>
  );
}
