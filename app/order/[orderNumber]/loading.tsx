import { Skeleton } from "@/components/ui/states/StateSkeleton";

export default function OrderConfirmationLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ background: "var(--color-background)", minHeight: "85vh", paddingBlock: "3rem 6rem" }}
    >
      <span className="sr-only">Loading order confirmation and tracking...</span>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2.5rem 2rem",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.25rem",
          }}
        >
          <Skeleton variant="circular" width="64px" height="64px" />
          <Skeleton variant="text" width="240px" height="1.75rem" />
          <Skeleton variant="text" width="340px" height="0.875rem" />
          <Skeleton variant="rectangular" width="100%" height="90px" borderRadius="var(--radius-md)" style={{ marginTop: "1rem" }} />
          <Skeleton variant="rectangular" width="100%" height="160px" borderRadius="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
}
