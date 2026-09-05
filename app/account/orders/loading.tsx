import { Skeleton, SkeletonOrderCard } from "@/components/ui/states/StateSkeleton";

export default function OrdersLoading() {
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
      <span className="sr-only">Loading your orders...</span>
      <Skeleton variant="text" width="140px" height="1.5rem" style={{ marginBottom: "1.75rem" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <SkeletonOrderCard key={i} />
        ))}
      </div>
    </div>
  );
}
