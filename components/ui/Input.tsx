import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, suffix, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full min-w-0">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-foreground)] max-w-full break-words leading-tight"
          >
            {label}
          </label>
        ) : null}
        <div className="relative flex items-center w-full min-w-0">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "h-11 w-full min-w-0 rounded-[var(--radius-md)] border px-3.5 text-sm",
              "bg-[var(--color-card)] text-[var(--color-foreground)]",
              "placeholder:text-[var(--color-muted)]",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
              suffix ? "pr-11" : "",
              error
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)]",
              className
            )}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            aria-invalid={!!error}
            {...props}
          />
          {suffix ? (
            <div className="absolute right-3 flex items-center justify-center text-[var(--color-muted)]">
              {suffix}
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-[var(--color-error)]"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-[var(--color-muted)]"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
