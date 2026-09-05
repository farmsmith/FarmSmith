import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium font-sans",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-primary)] text-white",
          "hover:bg-[var(--color-primary-dark)] hover:text-white",
          "active:scale-[0.98]",
          "focus-visible:ring-[var(--color-primary)]",
        ],
        accent: [
          "bg-[var(--color-accent)] text-[var(--color-primary)]",
          "hover:bg-[var(--color-accent-hover)]",
          "active:scale-[0.98]",
          "focus-visible:ring-[var(--color-accent)]",
        ],
        outline: [
          "border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent",
          "hover:bg-[var(--color-primary)] hover:text-white",
          "active:scale-[0.98]",
          "focus-visible:ring-[var(--color-primary)]",
        ],
        ghost: [
          "text-[var(--color-primary)] bg-transparent",
          "hover:bg-[var(--color-surface)]",
          "focus-visible:ring-[var(--color-primary)]",
        ],
        destructive: [
          "bg-[var(--color-error)] text-white",
          "hover:opacity-90",
          "focus-visible:ring-[var(--color-error)]",
        ],
      },

      size: {
        sm: "h-8 px-3 text-sm rounded-[var(--radius-sm)]",
        md: "h-11 px-6 text-sm rounded-[var(--radius-md)]",
        lg: "h-14 px-8 text-base rounded-[var(--radius-md)]",
        icon: "h-10 w-10 rounded-[var(--radius-md)]",
        "icon-sm": "h-8 w-8 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, asChild, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">Loading…</span>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
