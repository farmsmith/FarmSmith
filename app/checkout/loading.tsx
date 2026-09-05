import { Skeleton } from "@/components/ui/states/StateSkeleton";

export default function CheckoutLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ background: "var(--color-background)", minHeight: "85vh", paddingInline: "0.75rem", paddingBlock: "1.5rem 6rem" }}
    >
      <span className="sr-only">Loading checkout...</span>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Stepper bar skeleton */}
        <Skeleton
          variant="rectangular"
          height="54px"
          borderRadius="var(--radius-lg)"
          style={{ marginBottom: "2rem" }}
        />

        {/* 2-column checkout skeleton layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1.5rem",
          }}
          className="lg:grid-cols-[1.15fr_0.85fr]"
        >
          {/* Left: Form Card Skeleton */}
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <Skeleton variant="text" width="220px" height="1.5rem" />
            <Skeleton variant="text" width="300px" height="0.875rem" />
            <Skeleton variant="rectangular" height="48px" borderRadius="var(--radius-md)" style={{ marginTop: "0.5rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Skeleton variant="rectangular" height="48px" borderRadius="var(--radius-md)" />
              <Skeleton variant="rectangular" height="48px" borderRadius="var(--radius-md)" />
            </div>
            <Skeleton variant="rectangular" height="80px" borderRadius="var(--radius-md)" />
            <Skeleton variant="rectangular" height="52px" borderRadius="var(--radius-md)" style={{ marginTop: "1rem" }} />
          </div>

          {/* Right: Order Summary Skeleton */}
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              height: "fit-content",
            }}
          >
            <Skeleton variant="text" width="160px" height="1.25rem" style={{ marginBottom: "0.5rem" }} />
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <Skeleton variant="rectangular" width="52px" height="52px" borderRadius="var(--radius-md)" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <Skeleton variant="text" width="140px" height="0.875rem" />
                <Skeleton variant="text" width="80px" height="0.75rem" />
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Skeleton variant="text" width="60px" height="0.875rem" />
                <Skeleton variant="text" width="50px" height="0.875rem" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Skeleton variant="text" width="80px" height="0.875rem" />
                <Skeleton variant="text" width="50px" height="0.875rem" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
                <Skeleton variant="text" width="90px" height="1.125rem" />
                <Skeleton variant="text" width="70px" height="1.125rem" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
