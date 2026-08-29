import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function GET() {
  const headers = withSecurityHeaders();
  const supabase = createAdminSupabaseClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load products", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500, headers });
  }

  const ids = (products ?? []).map((product) => product.id);
  const { data: images, error: imagesError } = ids.length
    ? await supabase
        .from("product_images")
        .select("id, product_id, image_url, alt_text, sort_order, is_primary, created_at")
        .in("product_id", ids)
        .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (imagesError) {
    console.error("Failed to load product images", imagesError);
    return NextResponse.json({ error: "Failed to load product gallery" }, { status: 500, headers });
  }

  const imageMap = new Map<string, typeof images>();
  for (const image of images ?? []) {
    const current = imageMap.get(image.product_id) ?? [];
    current.push(image);
    imageMap.set(image.product_id, current);
  }

  return NextResponse.json(
    (products ?? []).map((product) => ({
      ...product,
      images: imageMap.get(product.id) ?? [],
    })),
    { status: 200, headers }
  );
}
