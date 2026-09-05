import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { StateSkeletonProps } from "@/types/ui-state";

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  borderRadius,
  className,
  style,
  count = 1,
}: StateSkeletonProps) {
  const getRadius = () => {
    if (borderRadius) return borderRadius;
    switch (variant) {
      case "circular":
        return "50%";
      case "text":
        return "var(--radius-sm)";
      case "card":
        return "var(--radius-xl)";
      case "rectangular":
      default:
        return "var(--radius-md)";
    }
  };

  const getHeight = () => {
    if (height) return height;
    switch (variant) {
      case "text":
        return "1rem";
      case "circular":
        return width || "40px";
      case "card":
        return "280px";
      case "rectangular":
      default:
        return "44px";
    }
  };

  const getWidth = () => {
    if (width) return width;
    switch (variant) {
      case "circular":
        return height || "40px";
      case "text":
      case "card":
      case "rectangular":
      default:
        return "100%";
    }
  };

  const elements = Array.from({ length: count });

  return (
    <>
      {elements.map((_, idx) => (
        <div
          key={idx}
          aria-hidden="true"
          className={cn("skeleton shrink-0 select-none", className)}
          style={{
            width: getWidth(),
            height: getHeight(),
            borderRadius: getRadius(),
            marginBottom: count > 1 && idx < count - 1 ? "0.5rem" : undefined,
            ...style,
          }}
        />
      ))}
    </>
  );
}

export function SkeletonText({
  lines = 3,
  className,
  style,
}: {
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex flex-col gap-2 w-full", className)}
      style={style}
    >
      {Array.from({ length: lines }).map((_, idx) => {
        const width = idx === 0 ? "85%" : idx === lines - 1 ? "60%" : "100%";
        return (
          <Skeleton
            key={idx}
            variant="text"
            width={width}
            height="0.875rem"
          />
        );
      })}
    </div>
  );
}

export function SkeletonCard({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-[var(--color-card)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden p-4 flex flex-col gap-3",
        className
      )}
      style={style}
    >
      <Skeleton variant="rectangular" height="220px" borderRadius="var(--radius-lg)" />
      <Skeleton variant="text" width="40%" height="0.75rem" />
      <Skeleton variant="text" width="80%" height="1.125rem" />
      <Skeleton variant="text" width="50%" height="0.875rem" />
      <Skeleton variant="rectangular" height="42px" borderRadius="var(--radius-md)" style={{ marginTop: "0.5rem" }} />
    </div>
  );
}

export function SkeletonOrderCard({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 flex flex-col gap-4 w-full",
        className
      )}
      style={style}
    >
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton variant="text" width="140px" height="1rem" />
          <Skeleton variant="text" width="100px" height="0.75rem" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width="80px" height="24px" borderRadius="var(--radius-full)" />
          <Skeleton variant="text" width="70px" height="1.125rem" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)] flex-wrap gap-2">
        <Skeleton variant="text" width="180px" height="0.875rem" />
        <Skeleton variant="rectangular" width="100px" height="32px" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
}

export function SkeletonProductDetail({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      role="status"
      aria-live="polite"
      className={cn("container py-12", className)}
      style={{ background: "var(--color-background)", ...style }}
    >
      <span className="sr-only">Loading product details...</span>
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-8">
        <Skeleton variant="text" width="50px" height="0.75rem" />
        <Skeleton variant="text" width="10px" height="0.75rem" />
        <Skeleton variant="text" width="50px" height="0.75rem" />
        <Skeleton variant="text" width="10px" height="0.75rem" />
        <Skeleton variant="text" width="120px" height="0.75rem" />
      </div>

      {/* 2-column detail grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left gallery skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton variant="rectangular" height="420px" borderRadius="var(--radius-xl)" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height="80px" borderRadius="var(--radius-md)" />
            ))}
          </div>
        </div>

        {/* Right info skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton variant="text" width="100px" height="0.75rem" />
          <Skeleton variant="text" width="85%" height="2.25rem" />
          <SkeletonText lines={2} />
          <div className="flex items-baseline gap-3 my-2">
            <Skeleton variant="text" width="120px" height="2rem" />
            <Skeleton variant="text" width="60px" height="1rem" />
          </div>
          <Skeleton variant="rectangular" height="52px" borderRadius="var(--radius-lg)" />
          <div className="flex flex-col gap-3 mt-4">
            <Skeleton variant="rectangular" height="46px" borderRadius="var(--radius-md)" />
            <Skeleton variant="rectangular" height="46px" borderRadius="var(--radius-md)" />
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-col gap-2">
            <Skeleton variant="text" width="160px" height="1.25rem" />
            <SkeletonText lines={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
