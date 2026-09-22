import type { MetadataRoute } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const baseUrl = "https://www.farmsmithfoods.com";

const BATCH_SIZE = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/why-us`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const supabase = createAdminSupabaseClient();
    const allProducts: Array<{ id: string; slug: string; updated_at?: string | null }> = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const to = from + BATCH_SIZE - 1;
      const { data: batch, error } = await supabase
        .from("products")
        .select("id, slug, updated_at")
        .eq("is_active", true)
        .order("id", { ascending: true })
        .range(from, to);

      if (error) {
        console.error(
          "Failed to fetch products batch for sitemap:",
          error.message
        );
        break;
      }

      if (!batch || batch.length === 0) {
        hasMore = false;
        break;
      }

      allProducts.push(...batch);

      if (batch.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        from += BATCH_SIZE;
      }
    }

    const productRoutes: MetadataRoute.Sitemap = allProducts
      .filter((product) => product.slug || product.id)
      .map((product) => {
        const rawSlug = product.slug || product.id;
        const finalSlug = rawSlug === "kandhamal-turmeric-powder" ? "turmeric-powder" : rawSlug;
        return {
          url: `${baseUrl}/shop/${finalSlug}`,
          lastModified: product.updated_at
            ? new Date(product.updated_at)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        };
      });

    if (productRoutes.length === 0) {
      productRoutes.push({
        url: `${baseUrl}/shop/turmeric-powder`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap:", error);

    return staticRoutes;
  }
}