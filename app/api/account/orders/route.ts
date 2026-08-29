import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function GET(request: Request) {
  const headers = withSecurityHeaders();
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

  const supabase = createAdminSupabaseClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, subtotal_amount, shipping_amount, tax_amount, total_amount, currency, created_at, updated_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load customer orders", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500, headers });
  }

  return NextResponse.json(orders ?? [], { status: 200, headers });
}
