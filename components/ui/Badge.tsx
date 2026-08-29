import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-[var(--color-card)]",
        accent: "bg-[var(--color-accent)] text-[var(--color-primary)]",
        outline: "border border-[var(--color-primary)] text-[var(--color-primary)]",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-amber-100 text-amber-800",
        error: "bg-red-100 text-red-800",
        muted: "bg-[var(--color-muted-bg)] text-[var(--color-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
