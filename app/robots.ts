import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/shop",
        "/shop/*",
        "/why-us",
        "/about-us",
        "/contact",
        "/track",
        "/privacy-policy",
        "/terms",
      ],
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
