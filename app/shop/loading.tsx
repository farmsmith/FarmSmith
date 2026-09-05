import { Skeleton, SkeletonCard } from "@/components/ui/states/StateSkeleton";

export default function ShopLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ background: "var(--color-background)", minHeight: "80vh" }}
    >
      <span className="sr-only">Loading products catalog...</span>
      {/* Header Banner Skeleton */}
      <div
        style={{
          background: "var(--color-card)",
          borderBottom: "1px solid var(--color-border)",
          paddingBlock: "3rem",
        }}
      >
        <div className="container">
          <Skeleton variant="text" width="90px" height="0.75rem" style={{ marginBottom: "0.75rem" }} />
          <Skeleton variant="text" width="280px" height="2.25rem" style={{ marginBottom: "0.75rem" }} />
          <Skeleton variant="text" width="420px" height="1rem" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container" style={{ paddingBlock: "3rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
