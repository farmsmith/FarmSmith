import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseSecret);

    // 1. Check if user exists in Supabase Auth
    const { data: userData, error: listError } = await adminSupabase.auth.admin.listUsers();

    if (listError) {
      console.error("Failed to query auth users:", listError.message);
      return NextResponse.json(
        { error: "Failed to verify account. Please try again." },
        { status: 500 }
      );
    }

    const userExists = userData.users.some(
      (user) => user.email?.toLowerCase() === cleanEmail
    );

    if (!userExists) {
      return NextResponse.json(
        { error: "No account found with this email address. Please check your email or sign up." },
        { status: 404 }
      );
    }

    // 2. Send reset password link to registered user
    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    const { error: resetError } = await adminSupabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${origin}/account`,
    });

    if (resetError) {
      return NextResponse.json(
        { error: resetError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset password API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
