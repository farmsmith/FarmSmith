import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface StateTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  children: React.ReactNode;
}

export function StateTitle({
  as: Component = "h2",
  className,
  children,
  style,
  ...props
}: StateTitleProps) {
  return (
    <Component
      className={cn("font-semibold leading-tight text-[var(--color-primary)]", className)}
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: Component === "h1" ? "clamp(1.75rem, 4vw, 2.5rem)" : "clamp(1.25rem, 2.5vw, 1.75rem)",
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface StateDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function StateDescription({
  className,
  children,
  style,
  ...props
}: StateDescriptionProps) {
  return (
    <p
      className={cn("text-[var(--color-muted)] leading-relaxed text-sm md:text-base", className)}
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: "460px",
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export interface StateEyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function StateEyebrow({
  className,
  children,
  style,
  ...props
}: StateEyebrowProps) {
  return (
    <p
      className={cn("eyebrow", className)}
      style={{
        marginBottom: "0.25rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}
