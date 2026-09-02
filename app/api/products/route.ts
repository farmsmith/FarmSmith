import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/data/products";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function GET() {
  const headers = withSecurityHeaders();
  // Public product catalog caching: allow Edge/CDN/Browsers to cache public list for 60s, stale 300s
  headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

  const products = await getActiveProducts();
  return NextResponse.json(products, { status: 200, headers });
}
