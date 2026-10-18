import "server-only";

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

function inMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Periodic pruning to avoid memory leaks in persistent containers
  if (buckets.size > 1000) {
    for (const [k, v] of buckets.entries()) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

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
 * Uses Upstash Redis REST API with HTTP keepalive if credentials are present,
 * otherwise falls back to local in-memory limiter.
 */
export async function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): Promise<RateLimitResult> {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL;
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!rawUrl || !rawToken) {
    return inMemoryRateLimit(key, limit, windowMs);
  }

  const url = rawUrl.trim().replace(/^["']|["']$/g, "");
  const token = rawToken.trim().replace(/^["']|["']$/g, "");

  if (!url || !token) {
    return inMemoryRateLimit(key, limit, windowMs);
  }

  const cleanUrl = (url.startsWith("http") ? url : `https://${url}`).replace(/\/+$/, "");
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const timeoutMs = Number(process.env.UPSTASH_REDIS_TIMEOUT_MS) || 4000;
  const category = key.split(":")[0] || "unknown";
  const start = performance.now();

  try {
    const res = await fetch(`${cleanUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", `ratelimit:${key}`],
        ["EXPIRE", `ratelimit:${key}`, windowSec, "NX"],
      ]),
      keepalive: true,
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    const duration = Math.round(performance.now() - start);

    if (!res.ok) {
      console.warn(`[RateLimit] Upstash Redis request returned status=${res.status} after ${duration}ms for category=${category}, falling back to local limiter`);
      return inMemoryRateLimit(key, limit, windowMs);
    }

    const data = (await res.json()) as Array<{ result: unknown }>;
    const count = Number(Array.isArray(data) ? (data[0]?.result ?? 1) : 1);
    const remaining = Math.max(0, limit - count);

    if (process.env.NODE_ENV !== "production" || duration > 500) {
      console.log(`[RateLimit] Redis check category=${category} duration=${duration}ms count=${count}/${limit}`);
    }

    return {
      success: count <= limit,
      remaining,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    const errorName = err instanceof Error ? err.name : "UnknownError";
    console.warn(`[RateLimit] Upstash Redis request failed after ${duration}ms (${errorName}) for category=${category}, falling back to local limiter`);
    return inMemoryRateLimit(key, limit, windowMs);
  }
}

/** Extracts a best-effort client IP from a Next.js Request. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}

