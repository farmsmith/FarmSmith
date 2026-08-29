import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils/cn";
import ProductGallery from "@/components/product/ProductGallery";
import TrustBadge, { TURMERIC_TRUST_BADGES } from "@/components/product/TrustBadge";
import ProductFactsGrid from "@/components/product/ProductFactsGrid";
import AddToCartButton from "@/components/product/AddToCartButton";
import QuantitySelector from "@/components/product/QuantitySelector";
import ProductDetailCompareTrigger from "@/components/product/ProductDetailCompareTrigger";
import type { Product } from "@/types/product";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products/${slug}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load product");
  return res.json();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.short_description ?? product.description ?? undefined,
  };
}

// Build product facts from product fields — this drives the numbered facts grid
function buildProductFacts(product: Product) {
  const facts = [];
  if (product.category) {
    facts.push({ label: "Category", value: product.category, detail: "GI-tagged sourcing region" });
  }
  facts.push({ label: "Testing", value: "Lab Certified", detail: "Third-party batch testing. Zero lead chromate, zero synthetic dyes." });
  facts.push({ label: "Sourcing", value: "GI-Tagged Origin", detail: "Traceable to the GI-registered growing region in India." });
  facts.push({ label: "Processing", value: "No Additives", detail: "No bleaching agents, no flow agents, no artificial colour." });
  return facts;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const facts = buildProductFacts(product);
  const inStock = product.stock_quantity > 0;
  const isLaunchingSoon =
    product.short_description?.toLowerCase().includes("launching soon") ||
    product.description?.toLowerCase().includes("launching soon") ||
    (!product.slug?.includes("turmeric") && !product.name?.toLowerCase().includes("turmeric"));

  return (
    <div style={{ background: "var(--color-background)" }}>
      <div className="container" style={{ paddingBlock: "3rem" }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "2rem" }}>
          <ol
            style={{ display: "flex", gap: "0.5rem", listStyle: "none", padding: 0, margin: 0, fontSize: "0.8125rem", color: "var(--color-muted)" }}
          >
            <li><a href="/" style={{ color: "var(--color-muted)", textDecoration: "none" }}>Home</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/shop" style={{ color: "var(--color-muted)", textDecoration: "none" }}>Shop</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: "var(--color-foreground)" }}>{product.name}</li>
          </ol>
        </nav>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            alignItems: "flex-start",
          }}
          className="lg:grid-cols-2"
        >
          {/* Gallery */}
          <div>
            <ProductGallery
              images={product.images ?? []}
              fallbackUrl={product.image_url}
              productName={product.name}
            />
          </div>

          {/* Product info */}
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>
              {product.category ?? "Organic Spice"}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                color: "var(--color-primary)",
                marginBottom: "0.5rem",
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>

            {product.short_description && (
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                {product.short_description}
              </p>
            )}

            {/* Price — Only shown for Turmeric */}
            {(product.slug?.includes("turmeric") || product.name?.toLowerCase().includes("turmeric")) && (
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                  }}
                >
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.unit && (
                  <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                    / {product.unit}
                  </span>
                )}
              </div>
            )}

            {/* Trust badges */}
            <TrustBadge
              badges={TURMERIC_TRUST_BADGES}
              className="mb-6"
            />

            {/* Stock status — Only for active available products */}
            {!isLaunchingSoon && (!inStock ? (
              <div
                style={{
                  background: "var(--color-error-bg)",
                  border: "1px solid var(--color-error)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                  color: "var(--color-error)",
                  fontWeight: 500,
                }}
                role="alert"
              >
                This product is currently out of stock.
              </div>
            ) : product.stock_quantity < 10 ? (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-accent)",
                  fontWeight: 600,
                  marginBottom: "1.25rem",
                }}
                role="status"
              >
                ⚡ Only {product.stock_quantity} left — order soon
              </p>
            ) : null)}

            {/* Quantity + Add to cart / Launching Soon button */}
            <QuantitySelector product={product} />

            {/* Why Farmsmith vs. Market Comparison Trigger */}
            <ProductDetailCompareTrigger product={product} />

            {/* Full description */}
            {product.description && (
              <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.125rem",
                    color: "var(--color-primary)",
                    marginBottom: "0.75rem",
                  }}
                >
                  About this product
                </h2>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Facts grid — full width below */}
        <ProductFactsGrid
          facts={facts}
          heading={`Know your ${product.name}`}
        />
      </div>
    </div>
  );
}
