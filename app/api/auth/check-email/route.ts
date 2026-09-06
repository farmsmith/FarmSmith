import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(request);
  const rl = await rateLimit(`check-email:${ip}`, 30, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400, headers }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminSupabase = createAdminSupabaseClient();

    const { data, error } = await adminSupabase.auth.admin.listUsers();
    if (error) {
      console.error("Error checking user existence in admin:", error);
      return NextResponse.json({ exists: false }, { status: 200, headers });
    }

    const exists = Boolean(
      data?.users?.some((u) => u.email?.toLowerCase() === cleanEmail)
    );

    return NextResponse.json({ exists }, { status: 200, headers });
  } catch (err) {
    console.error("Check email API error:", err);
    return NextResponse.json({ exists: false }, { status: 200, headers });
  }
}
