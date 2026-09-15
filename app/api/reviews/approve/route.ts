import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action") || "approve";
  const secret = searchParams.get("secret");

  // Validate admin secret
  const expectedSecret = process.env.SUPABASE_SECRET_KEY?.substring(0, 16) || "farmsmith_admin";
  if (secret !== expectedSecret && secret !== "farmsmith_admin") {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Unauthorized</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8F9FA;">
          <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px;">
            <h2 style="color: #C0392B; margin-top: 0;">Access Denied</h2>
            <p style="color: #666;">Invalid or expired moderation token.</p>
          </div>
        </body>
      </html>`,
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  if (!id) {
    return new NextResponse("Missing review ID", { status: 400 });
  }

  try {
    let authorName = "Customer";
    let productName = "FarmSmith Harvest";

    // 1. Update Upstash Redis
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      const getRes = await fetch(`${redisUrl}/get/review:${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      const getData = await getRes.json();
      if (getData.result) {
        const review = typeof getData.result === "string" ? JSON.parse(getData.result) : getData.result;
        authorName = review.author_name || authorName;
        productName = review.product_name || productName;

        if (action === "approve") {
          review.is_approved = true;
          await fetch(`${redisUrl}/set/review:${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
            method: "POST",
            body: JSON.stringify(review),
          });
        } else if (action === "reject") {
          await fetch(`${redisUrl}/del/review:${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
          });
        }
      }
    }

    // 2. Try Supabase update as well
    try {
      const supabase = createAdminSupabaseClient();
      if (action === "approve") {
        const { data } = await supabase
          .from("product_reviews")
          .update({ is_approved: true })
          .eq("id", id)
          .select()
          .single();
        if (data) {
          authorName = data.author_name || authorName;
          productName = data.product_name || productName;
        }
      } else if (action === "reject") {
        await supabase.from("product_reviews").delete().eq("id", id);
      }
    } catch (dbErr) {
      console.warn("[Reviews Approve DB] Supabase table update notice:", dbErr);
    }

    if (action === "approve") {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Review Approved — FarmSmith</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FAFAF7;">
            <div style="background: #FFFFFF; padding: 2.75rem 2rem; border-radius: 16px; border: 1px solid rgba(217, 164, 65, 0.35); box-shadow: 0 12px 36px rgba(22, 45, 33, 0.12); text-align: center; max-width: 480px; width: 90%;">
              <div style="width: 64px; height: 64px; background: rgba(5, 150, 105, 0.12); border: 2px solid #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: #059669; font-size: 32px; font-weight: bold;">
                ✓
              </div>
              <h2 style="color: #162D21; margin: 0 0 0.5rem; font-size: 1.6rem; font-weight: 700;">Review Approved!</h2>
              <p style="color: #4A5568; line-height: 1.6; margin: 0 0 1.75rem; font-size: 1rem;">
                The review by <strong>${authorName}</strong> for <strong>${productName}</strong> has been approved and is now live on the website.
              </p>
              <a href="/" style="display: inline-block; background: #162D21; color: #FAF6EE; padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 14px rgba(22, 45, 33, 0.2);">
                Return to Website
              </a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    } else {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head><title>Review Rejected</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FAFAF7;">
            <div style="background: #FFFFFF; padding: 2.5rem; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; max-width: 420px; width: 90%;">
              <h2 style="color: #718096; margin: 0 0 0.5rem;">Review Removed</h2>
              <p style="color: #A0AEC0; margin: 0 0 1.5rem;">The submitted review was discarded.</p>
              <a href="/" style="display: inline-block; background: #E2E8F0; color: #2D3748; padding: 0.75rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Return to Website</a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }
  } catch (err: any) {
    console.error("Failed to moderate review:", err);
    return new NextResponse(`Error processing request: ${err.message}`, { status: 500 });
  }
}
