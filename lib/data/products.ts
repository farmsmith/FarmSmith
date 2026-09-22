import "server-only";

import { cache } from "react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Product, ProductImage } from "@/types/product";

export interface GetActiveProductsOptions {
  limit?: number;
  offset?: number;
}

const DEFAULT_CATALOG_LIMIT = 100;
const MAX_CATALOG_LIMIT = 100;

/**
 * Server-side product data loader with React cache deduplication and bounded querying.
 * Eliminates loopback HTTP fetches and combines product and gallery queries into a single PostgREST join.
 */
export const getActiveProducts = cache(
  async (options?: GetActiveProductsOptions): Promise<Product[]> => {
    try {
      const rawLimit = options?.limit ?? DEFAULT_CATALOG_LIMIT;
      const rawOffset = options?.offset ?? 0;

      const limit =
        Number.isFinite(rawLimit) && rawLimit >= 1
          ? Math.min(rawLimit, MAX_CATALOG_LIMIT)
          : DEFAULT_CATALOG_LIMIT;
      const offset =
        Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

      const supabase = createAdminSupabaseClient();
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active, created_at, updated_at, product_images(id, product_id, image_url, alt_text, sort_order, is_primary, created_at)")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error || !products) {
        console.error("Failed to fetch products from database:", error);
        return [];
      }

      type RawProduct = Product & { product_images?: ProductImage[] };

      return (products as RawProduct[])
        .filter(
          (product) =>
            !product.short_description?.toLowerCase().includes("launching soon") &&
            !product.description?.toLowerCase().includes("launching soon")
        )
        .map((product) => ({
          ...product,
          slug: product.slug === "kandhamal-turmeric-powder" ? "turmeric-powder" : product.slug,
          images: (product.product_images ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        }));
    } catch (err) {
      console.error("Error in getActiveProducts:", err);
      return [];
    }
  }
);

/**
 * Server-side single product data loader with React cache deduplication.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  try {
    const supabase = createAdminSupabaseClient();
    const targetSlugs =
      slug === "turmeric-powder" || slug === "kandhamal-turmeric-powder"
        ? ["turmeric-powder", "kandhamal-turmeric-powder"]
        : [slug];

    const { data: product, error } = await supabase
      .from("products")
      .select("id, name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active, created_at, updated_at, product_images(id, product_id, image_url, alt_text, sort_order, is_primary, created_at)")
      .in("slug", targetSlugs)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error || !product) {
      if (slug === "turmeric-powder" || slug === "kandhamal-turmeric-powder") {
        return {
          id: "turmeric-001",
          name: "Farmsmith Turmeric Powder",
          slug: "turmeric-powder",
          sku: "FS-TURMERIC-001",
          short_description: "Pure GI-tagged Kandhamal turmeric powder with high curcumin content and batch test reports.",
          description: "Sourced directly from Kandhamal organic farming clusters in Odisha. 100% pure, unadulterated, and rich in natural curcumin.",
          category: "Powdered Spices",
          price: 129,
          currency: "INR",
          unit: "100g",
          weight_grams: 100,
          gst_rate: 5,
          image_url: "/images/Product 1.PNG",
          stock_quantity: 100,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [
            { id: "img-1", product_id: "turmeric-001", image_url: "/images/Product 1.PNG", alt_text: "Farmsmith Turmeric Powder Front View", sort_order: 0, is_primary: true, created_at: "" },
            { id: "img-2", product_id: "turmeric-001", image_url: "/images/Product 2.PNG", alt_text: "Farmsmith Turmeric Powder Angle View", sort_order: 1, is_primary: false, created_at: "" },
            { id: "img-3", product_id: "turmeric-001", image_url: "/images/Product 3.PNG", alt_text: "Farmsmith Turmeric Powder Nutrition Facts", sort_order: 2, is_primary: false, created_at: "" },
            { id: "img-4", product_id: "turmeric-001", image_url: "/images/Product 4.PNG", alt_text: "Farmsmith Turmeric Powder Quality Report", sort_order: 3, is_primary: false, created_at: "" },
          ],
        };
      }
      if (error) console.error("Failed to fetch product by slug from database:", error);
      return null;
    }

    const rawProduct = product as Product & { product_images?: ProductImage[] };
    const images = (rawProduct.product_images ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return {
      ...rawProduct,
      slug: "turmeric-powder",
      images,
    };
  } catch (err) {
    console.error("Error in getProductBySlug:", err);
    return null;
  }
});
