import { createClient, SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

/**
 * Supabase client for use in Client Components and the browser.
 * Uses a singleton pattern to avoid multiple GoTrueClient warnings.
 */
export function createBrowserSupabaseClient() {
  if (clientInstance) return clientInstance;

  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://placeholder.supabase.co";
  url = url.replace(/^"|"$/g, "").trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  let publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "dummy-anon-key";
  publishableKey = publishableKey.replace(/^"|"$/g, "").trim();

  clientInstance = createClient(url, publishableKey);
  return clientInstance;
}
