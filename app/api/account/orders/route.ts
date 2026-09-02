import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function GET(request: Request) {
  const headers = withSecurityHeaders();
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

  const supabase = createAdminSupabaseClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, tracking_token, status, subtotal_amount, shipping_amount, tax_amount, total_amount, currency, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (user.email) {
    query = query.or(`customer_id.eq.${user.id},customer_email.eq.${user.email}`);
  } else {
    query = query.eq("customer_id", user.id);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Failed to load customer orders", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500, headers });
  }

  // Asynchronously associate unlinked orders for this email with customer_id
  if (user.email && orders && orders.length > 0) {
    supabase
      .from("orders")
      .update({ customer_id: user.id })
      .eq("customer_email", user.email)
      .is("customer_id", null)
      .then(({ error: updateErr }) => {
        if (updateErr) console.error("Failed to auto-link customer_id to orders:", updateErr);
      });
  }

  return NextResponse.json(orders ?? [], { status: 200, headers });
}
