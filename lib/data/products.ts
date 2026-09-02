import "server-only";

import { cache } from "react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Product } from "@/types/product";

/**
 * Server-side product data loader with React cache deduplication.
 * Eliminates loopback HTTP fetches and combines product and gallery queries into a single PostgREST join.
 */
export const getActiveProducts = cache(async (): Promise<Product[]> => {
  try {
    const supabase = createAdminSupabaseClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active, created_at, updated_at, product_images(id, product_id, image_url, alt_text, sort_order, is_primary, created_at)")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !products) {
      console.error("Failed to fetch products from database:", error);
      return [];
    }

    return products.map((product: any) => ({
      ...product,
      images: (product.product_images ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }));
  } catch (err) {
    console.error("Error in getActiveProducts:", err);
    return [];
  }
});

/**
 * Server-side single product data loader with React cache deduplication.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  try {
    const supabase = createAdminSupabaseClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("id, name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active, created_at, updated_at, product_images(id, product_id, image_url, alt_text, sort_order, is_primary, created_at)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !product) {
      if (error) console.error("Failed to fetch product by slug from database:", error);
      return null;
    }

    const images = (product.product_images ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return {
      ...product,
      images,
    };
  } catch (err) {
    console.error("Error in getProductBySlug:", err);
    return null;
  }
});
