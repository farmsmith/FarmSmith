import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
  message?: string | null;
  className?: string;
  showIcon?: boolean;
}

/**
 * Reusable FieldError primitive for displaying accessible, user-safe form validation messages.
 * Automatically wires role="alert" and aria-live="polite" for assistive technology.
 */
export function FieldError({
  id,
  message,
  className,
  showIcon = false,
  ...props
}: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        "text-xs text-[var(--color-error)] flex items-center gap-1 mt-1 leading-snug",
        className
      )}
      {...props}
    >
      {showIcon && <AlertCircle size={13} className="shrink-0" aria-hidden="true" />}
      <span>{message}</span>
    </p>
  );
}
