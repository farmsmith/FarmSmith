import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { PublicProduct } from "@/types/product";

/**
 * Fetches all active products. Safe to call from Server Components too —
 * it uses the publishable-key client, which is RLS-gated to active
 * products only, so there's no need for a separate server-side path here.
 */
export async function getActiveProducts(): Promise<PublicProduct[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProductBySlug(
  slug: string
): Promise<PublicProduct | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
