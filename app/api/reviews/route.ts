import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";

const reviewSchema = z.object({
  productName: z.string().trim().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255).optional().or(z.literal("")),
  review: z.string().trim().min(1, "Review text is required").max(2000),
});

// Helper to save to Upstash Redis
async function saveToRedis(key: string, data: any) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: JSON.stringify(data),
    });
    // Add to all reviews list
    await fetch(`${url}/rpush/all_reviews_ids/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
    });
  } catch (err) {
    console.warn("[Reviews Redis] Redis write notice:", err);
  }
}

export async function POST(req: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(req);
  const rl = await rateLimit(`review:${ip}`, 5, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many reviews submitted. Please try again in a minute." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.format() },
        { status: 400, headers }
      );
    }

    const { productName, rating, name, email, review } = parsed.data;
    const reviewId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const reviewRecord = {
      id: reviewId,
      product_name: productName,
      rating,
      author_name: name,
      author_email: email || null,
      content: review,
      is_approved: false, // Pending admin approval
      created_at: createdAt,
    };

    // 1. Save to Redis (instant, robust persistence)
    await saveToRedis(`review:${reviewId}`, reviewRecord);

    // 2. Try to save to Supabase DB (table: product_reviews)
    try {
      const supabase = createAdminSupabaseClient();
      await supabase.from("product_reviews").insert(reviewRecord);
    } catch (dbErr) {
      console.warn("[Reviews DB] Supabase table notice:", dbErr);
    }

    // 3. Send email notification via Resend API with 1-Click Approve buttons
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = "farmsmith6@gmail.com";
    const senderEmail = "FarmSmith Reviews <onboarding@resend.dev>";

    if (resendApiKey) {
      try {
        const secret = process.env.SUPABASE_SECRET_KEY?.substring(0, 16) || "farmsmith_admin";
        
        // Dynamically detect current host so approval links work in both local development and production
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
        const protocol = host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
        const siteUrl = host ? `${protocol}://${host}` : (process.env.SITE_URL || "https://farm-smith.vercel.app");

        const approveUrl = `${siteUrl}/api/reviews/approve?id=${reviewId}&action=approve&secret=${secret}`;
        const rejectUrl = `${siteUrl}/api/reviews/approve?id=${reviewId}&action=reject&secret=${secret}`;

        console.log(`[Reviews API] Dispatching review notification with 1-Click Approve buttons to ${recipientEmail}...`);
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [recipientEmail],
            reply_to: email || undefined,
            subject: `[New Customer Review - ${rating}★] for ${productName} by ${name}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; line-height: 1.6; color: #1C3121; background-color: #FAFAF7; border-radius: 12px; max-width: 580px; margin: 0 auto;">
                <div style="background: #162D21; padding: 18px 24px; border-radius: 8px 8px 0 0; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between;">
                  <h2 style="margin: 0; font-size: 1.25rem; color: #FFFFFF; font-weight: 600;">
                    ✨ New Customer Review Submitted
                  </h2>
                </div>
                <div style="background: #FFFFFF; padding: 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                  <div style="margin-bottom: 16px;">
                    <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #6B7280; text-transform: uppercase; font-weight: 600;">Product</p>
                    <p style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #162D21;">${productName}</p>
                  </div>
                  
                  <div style="margin-bottom: 16px;">
                    <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #6B7280; text-transform: uppercase; font-weight: 600;">Rating</p>
                    <p style="margin: 0; font-size: 1.3rem; color: #D9A441; font-weight: bold;">
                      ${"★".repeat(rating)}${"☆".repeat(5 - rating)} <span style="font-size: 0.95rem; color: #4B5563; font-weight: normal;">(${rating} out of 5 stars)</span>
                    </p>
                  </div>

                  <div style="display: flex; gap: 24px; margin-bottom: 16px;">
                    <div>
                      <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #6B7280; text-transform: uppercase; font-weight: 600;">Customer</p>
                      <p style="margin: 0; font-weight: 600; color: #1F2937;">${name}</p>
                    </div>
                    ${
                      email
                        ? `<div>
                            <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #6B7280; text-transform: uppercase; font-weight: 600;">Email</p>
                            <p style="margin: 0; color: #1F2937;"><a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a></p>
                          </div>`
                        : ""
                    }
                  </div>

                  <div style="background: #FAF7F0; padding: 16px 20px; border-left: 4px solid #D9A441; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0 0 6px 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #A06B28; font-weight: 700;">Customer Feedback</p>
                    <p style="margin: 0; font-style: italic; color: #2D3748; font-size: 1rem; line-height: 1.6; white-space: pre-wrap;">&ldquo;${review}&rdquo;</p>
                  </div>

                  {/* Moderation Controls */}
                  <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
                    <p style="margin: 0 0 14px 0; font-size: 0.85rem; color: #6B7280; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">ADMIN MODERATION</p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                      <a href="${approveUrl}" target="_blank" style="display: inline-block; background: #162D21; color: #FAF6EE; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.95rem; box-shadow: 0 2px 8px rgba(22, 45, 33, 0.25);">
                        ✓ Approve Review (Make Live)
                      </a>
                      <a href="${rejectUrl}" target="_blank" style="display: inline-block; background: #F3F4F6; color: #6B7280; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-size: 0.95rem; font-weight: 500; margin-left: 8px;">
                        ✕ Reject
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            `,
          }),
        });

        const emailData = await emailRes.json();
        if (!emailRes.ok) {
          console.error("[Reviews API] Resend API Error:", emailData);
        } else {
          console.log("[Reviews API] Review notification email with Approve buttons sent successfully! Message ID:", emailData.id);
        }
      } catch (emailErr) {
        console.error("[Reviews API] Failed to forward review notification email:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review has been successfully submitted.",
        reviewId,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error handling review submit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

export async function GET(req: Request) {
  const headers = withSecurityHeaders();
  const { searchParams } = new URL(req.url);
  const productName = searchParams.get("product");

  try {
    // 1. Try Supabase first
    const supabase = createAdminSupabaseClient();
    let query = supabase
      .from("product_reviews")
      .select("id, product_name, rating, author_name, content, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (productName) {
      query = query.eq("product_name", productName);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json({ reviews: data }, { status: 200, headers });
    }

    // 2. Fallback to Upstash Redis
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      const keysRes = await fetch(`${url}/lrange/all_reviews_ids/0/-1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const keysData = await keysRes.json();
      if (keysData.result && Array.isArray(keysData.result)) {
        const reviews = [];
        for (const key of keysData.result.slice(-10)) {
          const itemRes = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const itemData = await itemRes.json();
          if (itemData.result) {
            const parsedItem = typeof itemData.result === "string" ? JSON.parse(itemData.result) : itemData.result;
            if (parsedItem.is_approved) {
              if (!productName || parsedItem.product_name === productName) {
                reviews.push(parsedItem);
              }
            }
          }
        }
        return NextResponse.json({ reviews: reviews.reverse() }, { status: 200, headers });
      }
    }

    return NextResponse.json({ reviews: [] }, { status: 200, headers });
  } catch {
    return NextResponse.json({ reviews: [] }, { status: 200, headers });
  }
}
