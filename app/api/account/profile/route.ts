import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  phone: z.string().trim().regex(/^(\+91[-\s]?)?[6-9]\d{9}$/, "Enter a valid Indian phone number"),
});

export async function GET(request: Request) {
  const headers = withSecurityHeaders();
  const ip = getClientIp(request);
  const rl = await rateLimit(`profile-get:${ip}`, 30, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests." }, { status: 429, headers });

  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

  const supabase = createAdminSupabaseClient();
  const { data: profile, error } = await supabase
    .from("customer_profiles")
    .select("id, full_name, phone, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load customer profile", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500, headers });
  }

  return NextResponse.json(
    {
      id: user.id,
      email: user.email ?? null,
      fullName: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
      phone: profile?.phone || user.user_metadata?.phone || (user as any).phone || "",
      createdAt: profile?.created_at ?? null,
      updatedAt: profile?.updated_at ?? null,
    },
    { status: 200, headers }
  );
}

export async function PATCH(request: Request) {
  const headers = withSecurityHeaders();
  const ip = getClientIp(request);
  const rl = await rateLimit(`profile-patch:${ip}`, 10, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests." }, { status: 429, headers });

  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile", details: parsed.error.flatten() }, { status: 400, headers });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customer_profiles")
    .upsert(
      {
        id: user.id,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
      { onConflict: "id" }
    )
    .select("id, full_name, phone, created_at, updated_at")
    .single();

  if (error) {
    console.error("Failed to save customer profile", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500, headers });
  }

  return NextResponse.json(
    { id: data.id, email: user.email ?? null, fullName: data.full_name, phone: data.phone, createdAt: data.created_at, updatedAt: data.updated_at },
    { status: 200, headers }
  );
}

