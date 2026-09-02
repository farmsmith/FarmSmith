import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/products";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const headers = withSecurityHeaders();
  headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404, headers });
  }

  return NextResponse.json(product, { status: 200, headers });
}
