import type { MetadataRoute } from "next";

const baseUrl = "https://www.farmsmithfoods.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/account",
        "/account/*",
        "/checkout",
        "/login",
        "/signup",
        "/reset-password",
        "/order/*",
        "/api/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}