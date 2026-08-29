export default function ShopLoading() {
  return (
    <div style={{ background: "var(--color-background)", minHeight: "80vh" }}>
      <div
        style={{
          background: "var(--color-card)",
          borderBottom: "1px solid var(--color-border)",
          paddingBlock: "3rem",
        }}
      >
        <div className="container">
          <div className="skeleton" style={{ width: "80px", height: "0.75rem", marginBottom: "0.75rem" }} />
          <div className="skeleton" style={{ width: "280px", height: "2rem", marginBottom: "0.75rem" }} />
          <div className="skeleton" style={{ width: "400px", height: "1rem" }} />
        </div>
      </div>
      <div className="container" style={{ paddingBlock: "3rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div className="skeleton" style={{ aspectRatio: "4/3" }} />
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div className="skeleton" style={{ width: "60%", height: "1rem" }} />
                <div className="skeleton" style={{ width: "80%", height: "1.25rem" }} />
                <div className="skeleton" style={{ width: "40%", height: "0.875rem" }} />
                <div className="skeleton" style={{ height: "44px", borderRadius: "var(--radius-md)", marginTop: "0.5rem" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
