import { Skeleton, SkeletonText } from "@/components/ui/states/StateSkeleton";

export default function OrderDetailLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "2rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <span className="sr-only">Loading order details...</span>
      {/* Back link skeleton */}
      <Skeleton variant="text" width="120px" height="0.875rem" style={{ marginBottom: "1.5rem" }} />

      {/* Header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Skeleton variant="text" width="180px" height="1.5rem" />
          <Skeleton variant="text" width="130px" height="0.875rem" />
        </div>
        <Skeleton variant="rectangular" width="90px" height="28px" borderRadius="var(--radius-full)" />
      </div>

      {/* Progress Timeline Skeleton */}
      <div style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--color-border)" }}>
        <Skeleton variant="text" width="140px" height="1rem" style={{ marginBottom: "1.25rem" }} />
        <Skeleton variant="rectangular" height="50px" borderRadius="var(--radius-md)" />
      </div>

      {/* Items Skeleton */}
      <div style={{ marginBottom: "2rem" }}>
        <Skeleton variant="text" width="120px" height="1rem" style={{ marginBottom: "1rem" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)" }}>
              <Skeleton variant="text" width="180px" height="0.875rem" />
              <Skeleton variant="text" width="70px" height="0.875rem" />
            </div>
          ))}
        </div>
      </div>

      {/* Totals Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton variant="text" width="70px" height="0.875rem" />
          <Skeleton variant="text" width="60px" height="0.875rem" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton variant="text" width="70px" height="0.875rem" />
          <Skeleton variant="text" width="60px" height="0.875rem" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "2px solid var(--color-border)" }}>
          <Skeleton variant="text" width="50px" height="1.125rem" />
          <Skeleton variant="text" width="80px" height="1.125rem" />
        </div>
      </div>
    </div>
  );
}
