import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const headers = withSecurityHeaders();
  const { slug } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active, created_at, updated_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load product", error);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500, headers });
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404, headers });
  }

  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("id, product_id, image_url, alt_text, sort_order, is_primary, created_at")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  if (imagesError) {
    console.error("Failed to load product gallery", imagesError);
    return NextResponse.json({ error: "Failed to load product gallery" }, { status: 500, headers });
  }

  return NextResponse.json({ ...product, images: images ?? [] }, { status: 200, headers });
}
