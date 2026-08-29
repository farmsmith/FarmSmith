import "server-only";

/**
 * Minimal in-memory rate limiter.
 *
 * IMPORTANT LIMITATION: Vercel serverless/edge functions are not
 * guaranteed to reuse the same instance between requests, so this memory
 * is NOT shared reliably across all traffic — it only limits repeated
 * requests that happen to land on the same warm instance.
 *
 * This is fine as a first layer while FarmSmith has low traffic. If abuse
 * becomes a real problem, upgrade to a shared store like Upstash Redis
 * (free tier) via @upstash/ratelimit — same interface, but consistent
 * across all instances.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * @param key Unique identifier for the caller, e.g. `ip:endpoint`
 * @param limit Max requests allowed within the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

/** Extracts a best-effort client IP from a Next.js Request. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}
