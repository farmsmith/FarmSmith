import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";

const DEFAULT_BASELINE_COUNT = 0;

export async function GET() {
  const headers = withSecurityHeaders();

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("site_metrics")
      .select("count")
      .eq("id", "batch_verifications")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { success: true, count: DEFAULT_BASELINE_COUNT },
        { status: 200, headers }
      );
    }

    const count = typeof data.count === "number" ? data.count : parseInt(String(data.count), 10) || DEFAULT_BASELINE_COUNT;

    return NextResponse.json(
      { success: true, count },
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Error fetching batch verification count:", err);
    return NextResponse.json(
      { success: true, count: DEFAULT_BASELINE_COUNT },
      { status: 200, headers }
    );
  }
}

export async function POST(req: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(req);
  const rl = await rateLimit(`metric:verify-quality:${ip}`, 30, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many verification requests. Please wait a moment." },
      { status: 429, headers }
    );
  }

  try {
    const supabase = createAdminSupabaseClient();

    // 1. Try invoking the atomic RPC function first
    const { data: rpcCount, error: rpcError } = await supabase.rpc("increment_site_metric", {
      metric_id: "batch_verifications",
      increment_by: 1,
    });

    if (!rpcError && rpcCount !== null && rpcCount !== undefined) {
      const finalCount = typeof rpcCount === "number" ? rpcCount : parseInt(String(rpcCount), 10) || DEFAULT_BASELINE_COUNT;
      return NextResponse.json(
        { success: true, count: finalCount },
        { status: 200, headers }
      );
    }

    // 2. Fallback: manual select + upsert if RPC is not defined in DB yet
    const { data: currentData } = await supabase
      .from("site_metrics")
      .select("count")
      .eq("id", "batch_verifications")
      .maybeSingle();

    const currentCount = currentData?.count ? (typeof currentData.count === "number" ? currentData.count : parseInt(String(currentData.count), 10)) : DEFAULT_BASELINE_COUNT;
    const newCount = currentCount + 1;

    await supabase
      .from("site_metrics")
      .upsert({ id: "batch_verifications", count: newCount, updated_at: new Date().toISOString() });

    return NextResponse.json(
      { success: true, count: newCount },
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Error incrementing batch verification count:", err);
    return NextResponse.json(
      { success: true, count: DEFAULT_BASELINE_COUNT + 1 },
      { status: 200, headers }
    );
  }
}
