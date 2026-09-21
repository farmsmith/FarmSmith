import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyModerationToken, consumeModerationToken } from "@/lib/security/review-moderation";
import { escapeHtml } from "@/lib/security/html";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const token = searchParams.get("token");
  const expires = searchParams.get("expires");

  // Validate action
  if (action !== "approve" && action !== "reject") {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head><title>Invalid Request</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8F9FA;">
          <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px;">
            <h2 style="color: #C0392B; margin-top: 0;">Invalid Action</h2>
            <p style="color: #666;">The specified moderation action is invalid.</p>
          </div>
        </body>
      </html>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Validate review ID format
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{8,64}$/.test(id.trim())) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head><title>Invalid Request</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8F9FA;">
          <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px;">
            <h2 style="color: #C0392B; margin-top: 0;">Invalid Review ID</h2>
            <p style="color: #666;">Missing or malformed review ID.</p>
          </div>
        </body>
      </html>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const cleanId = id.trim();

  // 1. Validate cryptographic HMAC moderation token (fails closed)
  const isAuthorized = verifyModerationToken({
    reviewId: cleanId,
    action,
    token,
    expiresAt: expires,
  });

  if (!isAuthorized) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head><title>Unauthorized</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8F9FA;">
          <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px;">
            <h2 style="color: #C0392B; margin-top: 0;">Access Denied</h2>
            <p style="color: #666;">Invalid, tampered, or expired moderation token.</p>
          </div>
        </body>
      </html>`,
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // 2. Enforce atomic single-use replay protection
  const consumption = await consumeModerationToken(token!, expires!);
  if (!consumption.success) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head><title>Link Expired or Already Used</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8F9FA;">
          <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 420px;">
            <h2 style="color: #C0392B; margin-top: 0;">Link Already Used</h2>
            <p style="color: #666;">This moderation action has already been executed. Moderation links are single-use.</p>
            <a href="/" style="display: inline-block; background: #162D21; color: #FAF6EE; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; margin-top: 1rem;">
              Return to Website
            </a>
          </div>
        </body>
      </html>`,
      { status: 409, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    let authorName = "Customer";
    let productName = "FarmSmith Harvest";

    // 3. Update Upstash Redis
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      const getRes = await fetch(`${redisUrl}/get/review:${encodeURIComponent(cleanId)}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      const getData = await getRes.json();
      if (getData.result) {
        const review = typeof getData.result === "string" ? JSON.parse(getData.result) : getData.result;
        authorName = review.author_name || authorName;
        productName = review.product_name || productName;

        if (action === "approve") {
          review.is_approved = true;
          await fetch(`${redisUrl}/set/review:${encodeURIComponent(cleanId)}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
            method: "POST",
            body: JSON.stringify(review),
          });
        } else if (action === "reject") {
          await fetch(`${redisUrl}/del/review:${encodeURIComponent(cleanId)}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
          });
        }
      }
    }

    // 4. Try Supabase update as well
    try {
      const supabase = createAdminSupabaseClient();
      if (action === "approve") {
        const { data } = await supabase
          .from("product_reviews")
          .update({ is_approved: true })
          .eq("id", cleanId)
          .select()
          .single();
        if (data) {
          authorName = data.author_name || authorName;
          productName = data.product_name || productName;
        }
      } else if (action === "reject") {
        await supabase.from("product_reviews").delete().eq("id", cleanId);
      }
    } catch (dbErr) {
      console.warn("[Reviews Approve DB] Supabase table update notice:", dbErr);
    }

    // 5. Escape dynamic parameters to prevent Stored XSS
    const safeAuthorName = escapeHtml(authorName);
    const safeProductName = escapeHtml(productName);

    if (action === "approve") {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Review Approved — FarmSmith</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FAFAF7;">
            <div style="background: #FFFFFF; padding: 2.75rem 2rem; border-radius: 16px; border: 1px solid rgba(217, 164, 65, 0.35); box-shadow: 0 12px 36px rgba(22, 45, 33, 0.12); text-align: center; max-width: 480px; width: 90%;">
              <div style="width: 64px; height: 64px; background: rgba(5, 150, 105, 0.12); border: 2px solid #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: #059669;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="color: #162D21; margin: 0 0 0.5rem; font-size: 1.6rem; font-weight: 700;">Review Approved!</h2>
              <p style="color: #4A5568; line-height: 1.6; margin: 0 0 1.75rem; font-size: 1rem;">
                The review by <strong>${safeAuthorName}</strong> for <strong>${safeProductName}</strong> has been approved and is now live on the website.
              </p>
              <a href="/" style="display: inline-block; background: #162D21; color: #FAF6EE; padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 14px rgba(22, 45, 33, 0.2);">
                Return to Website
              </a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    } else {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Review Rejected — FarmSmith</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FAFAF7;">
            <div style="background: #FFFFFF; padding: 2.5rem; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; max-width: 420px; width: 90%;">
              <h2 style="color: #718096; margin: 0 0 0.5rem;">Review Removed</h2>
              <p style="color: #A0AEC0; margin: 0 0 1.5rem;">The submitted review was discarded.</p>
              <a href="/" style="display: inline-block; background: #E2E8F0; color: #2D3748; padding: 0.75rem 1.75rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Return to Website</a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
  } catch (err: unknown) {
    console.error("Failed to moderate review:", err);
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head><title>Internal Server Error</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8F9FA;">
          <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px;">
            <h2 style="color: #C0392B; margin-top: 0;">Error</h2>
            <p style="color: #666;">An error occurred while processing the moderation request.</p>
          </div>
        </body>
      </html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
