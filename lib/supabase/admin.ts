import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — SERVER ONLY.
 *
 * The `import "server-only"` line above makes it a BUILD ERROR to import
 * this file from any Client Component or browser-bound code, rather than
 * silently leaking the secret key into the frontend bundle.
 *
 * Uses the SECRET key, which bypasses Row Level Security entirely
 * (Postgres BYPASSRLS). This is the only place in the codebase that
 * should ever read or write orders, order_items, or inventory_movements.
 *
 * Only import this from:
 *  - Route Handlers (app/api/.../route.ts)
 *  - Server Actions
 *  - Server Components that genuinely need admin-level DB access
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env vars."
    );
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
