import type { MetadataRoute } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const baseUrl = "https://www.farmsmithfoods.com";

const BATCH_SIZE = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/why-us`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/track`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const supabase = createAdminSupabaseClient();
    const allProducts: Array<{
      id: string;
      slug: string | null;
      short_description?: string | null;
      description?: string | null;
      updated_at?: string | null;
    }> = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const to = from + BATCH_SIZE - 1;
      const { data: batch, error } = await supabase
        .from("products")
        .select("id, slug, short_description, description, updated_at")
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

    const seenSlugs = new Set<string>();
    const productRoutes: MetadataRoute.Sitemap = [];

    for (const product of allProducts) {
      // Filter out launching soon items
      const isLaunchingSoon =
        product.short_description?.toLowerCase().includes("launching soon") ||
        product.description?.toLowerCase().includes("launching soon");
      if (isLaunchingSoon) continue;

      const rawSlug = product.slug;
      if (!rawSlug) continue;

      const finalSlug =
        rawSlug === "kandhamal-turmeric-powder" ? "turmeric-powder" : rawSlug;

      if (seenSlugs.has(finalSlug)) continue;
      seenSlugs.add(finalSlug);

      const entry: MetadataRoute.Sitemap[number] = {
        url: `${baseUrl}/shop/${finalSlug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      };

      if (product.updated_at) {
        const parsedDate = new Date(product.updated_at);
        if (!isNaN(parsedDate.getTime())) {
          entry.lastModified = parsedDate;
        }
      }

      productRoutes.push(entry);
    }

    if (productRoutes.length === 0) {
      productRoutes.push({
        url: `${baseUrl}/shop/turmeric-powder`,
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