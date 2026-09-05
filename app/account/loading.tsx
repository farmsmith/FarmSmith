import { Skeleton, SkeletonText } from "@/components/ui/states/StateSkeleton";

export default function AccountLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ background: "var(--color-background)", minHeight: "80vh", width: "100%" }}
    >
      <span className="sr-only">Loading account profile...</span>
      <div className="container" style={{ paddingBlock: "2rem 3.5rem", paddingInline: "1rem" }}>
        <div
          style={{
            maxWidth: "640px",
            width: "100%",
            margin: "0 auto",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Header Skeleton */}
          <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
            <div className="flex flex-col gap-1.5">
              <Skeleton variant="text" width="160px" height="1.5rem" />
              <Skeleton variant="text" width="220px" height="0.875rem" />
            </div>
            <Skeleton variant="rectangular" width="110px" height="36px" borderRadius="var(--radius-md)" />
          </div>

          {/* Profile Field Rows Skeletons */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <Skeleton variant="circular" width="36px" height="36px" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton variant="text" width="70px" height="0.6875rem" />
                <Skeleton variant="text" width="160px" height="0.9375rem" />
              </div>
            </div>
          ))}

          {/* Action Row */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <Skeleton variant="rectangular" width="130px" height="38px" borderRadius="var(--radius-md)" />
          </div>
        </div>
      </div>
    </div>
  );
}
