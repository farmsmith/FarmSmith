"use client";

import { useState, useMemo } from "react";
import { Package, Sparkles, Rocket } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

interface ShopClientProps {
  initialProducts: Product[];
}

const CATEGORIES = [
  "All Items",
  "Powdered Spices",
  "Oil",
  "Rice",
  "Daal",
  "Grains / Pulses",
];

const FALLBACK_LAUNCH_PRODUCTS: Product[] = [
  {
    id: "turmeric-001",
    name: "Farmsmith Turmeric Powder",
    slug: "kandhamal-turmeric-powder",
    sku: "FS-TURMERIC-001",
    short_description: "Pure GI-tagged Kandhamal turmeric powder with high curcumin content and batch test reports.",
    description: "Sourced directly from Kandhamal organic farming clusters in Odisha.",
    category: "Powdered Spices",
    price: 129,
    currency: "INR",
    unit: "100g",
    weight_grams: 100,
    gst_rate: 5,
    image_url: "/images/product_turmeric.png",
    stock_quantity: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "oil-001",
    name: "Cold-Pressed Kachi Ghani Mustard Oil",
    slug: "cold-pressed-mustard-oil",
    sku: "FS-OIL-001",
    short_description: "Pure traditional cold-pressed mustard oil with natural aroma & rich nutrients. Launching Soon!",
    description: "Extracted slowly using wooden ghani methods without synthetic heat or chemicals.",
    category: "Oil",
    price: 249,
    currency: "INR",
    unit: "500ml",
    weight_grams: 500,
    gst_rate: 5,
    image_url: "/images/product_mustard_oil.png",
    stock_quantity: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "rice-001",
    name: "GI-Tagged Organic Aromatic Rice",
    slug: "gi-tagged-aromatic-rice",
    sku: "FS-RICE-001",
    short_description: "Unpolished GI-tagged aromatic rice harvested from natural spring water farms. Launching Soon!",
    description: "Single-origin heritage rice grown with zero pesticides.",
    category: "Rice",
    price: 199,
    currency: "INR",
    unit: "1 kg",
    weight_grams: 1000,
    gst_rate: 5,
    image_url: "/images/product_aromatic_rice.png",
    stock_quantity: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "daal-001",
    name: "Unpolished Organic Arhar Daal (Toor)",
    slug: "unpolished-arhar-daal",
    sku: "FS-DAAL-001",
    short_description: "High-protein, unpolished organic yellow lentils direct from farm gates. Launching Soon!",
    description: "Unpolished yellow split pulses containing zero artificial color.",
    category: "Daal",
    price: 149,
    currency: "INR",
    unit: "1 kg",
    weight_grams: 1000,
    gst_rate: 5,
    image_url: "/images/product_arhar_daal.png",
    stock_quantity: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "grain-001",
    name: "FarmFresh Ancient Grains & Pulses Mix",
    slug: "ancient-grains-pulses-mix",
    sku: "FS-GRAIN-001",
    short_description: "Nutrient-dense ancient grains and organic whole pulses blend. Launching Soon!",
    description: "A balanced superfood mixture of millets, moong, and wild grains.",
    category: "Grains / Pulses",
    price: 179,
    currency: "INR",
    unit: "1 kg",
    weight_grams: 1000,
    gst_rate: 5,
    image_url: "/images/product_ancient_grains.png",
    stock_quantity: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Items");

  const allProducts = useMemo(() => {
    return initialProducts && initialProducts.length > 0
      ? initialProducts
      : FALLBACK_LAUNCH_PRODUCTS;
  }, [initialProducts]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filtering
    if (selectedCategory !== "All Items") {
      const catTarget = selectedCategory.toLowerCase();
      result = result.filter((p) => {
        const productCat = (p.category ?? "").toLowerCase();
        const productName = (p.name ?? "").toLowerCase();
        return (
          productCat.includes(catTarget) ||
          productName.includes(catTarget) ||
          (catTarget.includes("oil") && (productCat.includes("oil") || productName.includes("oil"))) ||
          (catTarget.includes("rice") && (productCat.includes("rice") || productName.includes("rice"))) ||
          (catTarget.includes("daal") && (productCat.includes("daal") || productName.includes("daal") || productName.includes("toor") || productName.includes("lentil"))) ||
          (catTarget.includes("grain") && (productCat.includes("grain") || productCat.includes("pulse") || productName.includes("grain") || productName.includes("pulse"))) ||
          (catTarget.includes("spice") && (productCat.includes("spice") || productName.includes("spice") || productName.includes("turmeric") || productName.includes("chilli")))
        );
      });
    }

    return result;
  }, [allProducts, selectedCategory]);

  // Separate Available Now vs Launching Soon products
  const availableProducts = useMemo(
    () =>
      filteredProducts.filter(
        (p) =>
          !p.short_description?.toLowerCase().includes("launching soon") &&
          !p.description?.toLowerCase().includes("launching soon")
      ),
    [filteredProducts]
  );

  const launchingSoonProducts = useMemo(
    () =>
      filteredProducts.filter(
        (p) =>
          p.short_description?.toLowerCase().includes("launching soon") ||
          p.description?.toLowerCase().includes("launching soon")
      ),
    [filteredProducts]
  );

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh", paddingBottom: "5rem" }}>
      <style>{`
        .shop-hero-banner {
          background: linear-gradient(135deg, #172D23 0%, #1F3A2E 50%, #294A3B 100%);
          border-bottom: 1px solid rgba(217, 164, 65, 0.2);
          padding: 4rem 1.5rem 3.5rem;
          text-align: center;
          color: #FBFAF6;
          position: relative;
          overflow: hidden;
        }
        .filter-sort-bar {
          background: var(--color-card);
          border-bottom: 1px solid var(--color-border);
          padding: 1.125rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }
        .pills-scroll-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem 0.625rem;
        }
        .filter-pill {
          padding: 0.55rem 1.35rem;
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid var(--color-border);
          background: #FFFFFF;
          color: var(--color-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .filter-pill.active {
          background: var(--color-primary);
          color: #FFFFFF;
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(31, 58, 46, 0.25);
        }
        .filter-pill:hover:not(.active) {
          background: var(--color-surface);
          border-color: #C4883E;
        }
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.75rem;
        }
        @media (min-width: 640px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 900px) {
          .shop-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1200px) {
          .shop-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>

      {/* 1. Hero Header Banner */}
      <section className="shop-hero-banner">
        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(217, 164, 65, 0.15)",
              border: "1px solid rgba(217, 164, 65, 0.35)",
              padding: "0.35rem 0.9rem",
              borderRadius: "100px",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D9A441" }}>
              100% Organically Harvested &bull; GI-Tagged
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: "0.875rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Our Organic Collection
          </h1>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "rgba(251, 250, 246, 0.88)",
              lineHeight: 1.7,
              margin: "0 auto",
              maxWidth: "560px",
            }}
          >
            Handcrafted spices, pure cold-pressed oils, single-origin grains, and farm-fresh essentials made with complete batch transparency.
          </p>
        </div>
      </section>

      {/* 2. Filter Pills & Sort Bar */}
      <section className="filter-sort-bar">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          {/* Category Filter Pills */}
          <div className="pills-scroll-container">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`filter-pill ${active ? "active" : ""}`}
                >
                  {category}
                </button>
              );
            })}
        </div>
      </div>
    </section>

      {/* 3. Product Catalog Content */}
      <div className="container" style={{ paddingTop: "2.5rem" }}>
        {filteredProducts.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.25rem",
              padding: "5rem 0",
              textAlign: "center",
            }}
          >
            <Package size={56} style={{ color: "var(--color-muted)", opacity: 0.4 }} />
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", fontSize: "1.5rem" }}>
              No products found
            </h2>
            <p style={{ color: "var(--color-muted)", maxWidth: "340px" }}>
              We couldn't find any products in this category. Select another category above.
            </p>
          </div>
        ) : (
          <>
            {/* SECTION 1: Available Now (Flagship Products) */}
            {availableProducts.length > 0 && (
              <section style={{ marginBottom: launchingSoonProducts.length > 0 ? "3.5rem" : "0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "2px solid var(--color-primary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#2ECC71",
                        boxShadow: "0 0 8px rgba(46, 204, 113, 0.6)",
                        display: "inline-block",
                      }}
                    />
                    <h2
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        margin: 0,
                      }}
                    >
                      Available Now
                    </h2>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#1F3A2E",
                      background: "#E8F5E9",
                      border: "1px solid #2E4D32",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {availableProducts.length} Ready to Ship
                  </span>
                </div>

                <ul
                  role="list"
                  aria-label="Available Products"
                  className="shop-grid"
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {availableProducts.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* SECTION 2: Launching Soon Products */}
            {launchingSoonProducts.length > 0 && (
              <section style={{ marginTop: availableProducts.length > 0 ? "2.5rem" : "0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px dashed var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#FFFBF0",
                        border: "1px solid #D9A441",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                      }}
                    >
                      🚀
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "1.35rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        Launching Soon
                      </h2>
                      <p style={{ fontSize: "0.78125rem", color: "var(--color-muted)", margin: 0, lineHeight: 1.35 }}>
                        Upcoming organic harvests in<br className="mobile-br" /> traditional farm processing
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#B37E14",
                      background: "#FFFBF0",
                      border: "1px solid #D9A441",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {launchingSoonProducts.length} Upcoming
                  </span>
                </div>

                <ul
                  role="list"
                  aria-label="Launching Soon Products"
                  className="shop-grid"
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {launchingSoonProducts.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
