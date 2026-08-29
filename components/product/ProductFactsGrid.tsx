interface ProductFact {
  label: string;
  value: string;
  detail?: string;
}

interface ProductFactsGridProps {
  facts: ProductFact[];
  heading?: string;
}

/**
 * ProductFactsGrid — numbered cards (01, 02, …) driven by a facts array.
 * This pattern is ONLY used for genuinely sequential/numbered content,
 * per the brand design language.
 */
export default function ProductFactsGrid({
  facts,
  heading = "Know what's in it",
}: ProductFactsGridProps) {
  if (!facts.length) return null;

  return (
    <section aria-labelledby="facts-heading" style={{ marginBlock: "3rem" }}>
      <p
        className="eyebrow"
        style={{ marginBottom: "0.5rem" }}
      >
        Transparency
      </p>
      <h2
        id="facts-heading"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 600,
          color: "var(--color-primary)",
          marginBottom: "2rem",
        }}
      >
        {heading}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {facts.map((fact, idx) => (
          <article
            key={fact.label}
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              position: "relative",
              overflow: "hidden",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Numbered indicator */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1.25rem",
                fontFamily: "var(--font-heading)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                opacity: 0.06,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </div>

            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                marginBottom: "0.5rem",
              }}
            >
              {fact.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                marginBottom: fact.detail ? "0.375rem" : 0,
              }}
            >
              {fact.value}
            </p>
            {fact.detail && (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.5,
                }}
              >
                {fact.detail}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
