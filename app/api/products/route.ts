import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/data/products";
import { withSecurityHeaders } from "@/lib/security/headers";

const DEFAULT_PAGE_LIMIT = 24;
const MAX_PAGE_LIMIT = 50;

export async function GET(request: Request) {
  const headers = withSecurityHeaders();
  // Public product catalog caching: allow Edge/CDN/Browsers to cache public list for 60s, stale 300s
  headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

  const { searchParams } = new URL(request.url);
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const rawLimit = parseInt(searchParams.get("limit") ?? `${DEFAULT_PAGE_LIMIT}`, 10);

  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit >= 1
    ? Math.min(rawLimit, MAX_PAGE_LIMIT)
    : DEFAULT_PAGE_LIMIT;
  const offset = (page - 1) * limit;

  const products = await getActiveProducts({ limit, offset });
  return NextResponse.json(products, { status: 200, headers });
}

