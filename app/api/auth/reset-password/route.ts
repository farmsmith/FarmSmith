import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(request);
  const rl = await rateLimit(`reset-password:${ip}`, 5, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many password reset requests. Please wait a minute before trying again." },
      { status: 429, headers }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400, headers }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const adminSupabase = createAdminSupabaseClient();

    // Trigger password reset email via Supabase Auth without full user scanning
    const { error: resetError } = await adminSupabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${origin}/account`,
    });

    if (resetError) {
      console.error("Password reset dispatch error (internal log only):", resetError.message);
    }

    // Always return uniform success response for valid email format to prevent user enumeration
    return NextResponse.json({ success: true }, { status: 200, headers });
  } catch (err: any) {
    console.error("Reset password API error:", err);
    // Return generic success to avoid leaking server errors or account state
    return NextResponse.json(
      { success: true },
      { status: 200, headers }
    );
  }
}

