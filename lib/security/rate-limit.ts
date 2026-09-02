import "server-only";

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

function inMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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

/**
 * Distributed rate limiter with graceful in-memory fallback.
 * Uses Upstash Redis REST API if credentials are present, otherwise falls back to local in-memory.
 */
export async function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return inMemoryRateLimit(key, limit, windowMs);
  }

  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));

    const res = await fetch(`${formattedUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", `ratelimit:${key}`],
        ["EXPIRE", `ratelimit:${key}`, windowSec],
      ]),
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Upstash Redis rate limit request failed, falling back to local limiter", res.status);
      return inMemoryRateLimit(key, limit, windowMs);
    }

    const data = (await res.json()) as Array<{ result: unknown }>;
    const count = Number(data[0]?.result ?? 1);
    const remaining = Math.max(0, limit - count);

    return {
      success: count <= limit,
      remaining,
    };
  } catch (err) {
    console.error("Upstash Redis rate limit error, falling back to local limiter", err);
    return inMemoryRateLimit(key, limit, windowMs);
  }
}

/** Extracts a best-effort client IP from a Next.js Request. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}

