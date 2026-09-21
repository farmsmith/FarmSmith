import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_EXPIRATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

// In-memory fallback map for process-lifetime single-use enforcement
const inMemoryConsumedTokens = new Map<string, number>();

function getModerationSecret(): string {
  const secret = process.env.REVIEW_MODERATION_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      "REVIEW_MODERATION_SECRET is not configured or is too short (min 16 characters required). Review moderation fails closed."
    );
  }
  return secret.trim();
}

/**
 * Generates an HMAC-based, single-action, time-bounded cryptographic token
 * for review moderation (approve or reject).
 */
export function generateModerationToken(
  reviewId: string,
  action: "approve" | "reject",
  expiresInMs: number = DEFAULT_EXPIRATION_MS
): { token: string; expiresAt: number } {
  if (!reviewId || typeof reviewId !== "string") {
    throw new Error("Invalid reviewId provided for moderation token generation.");
  }

  const secret = getModerationSecret();
  const expiresAt = Date.now() + expiresInMs;
  const payload = `${reviewId}:${action}:${expiresAt}`;
  const token = createHmac("sha256", secret).update(payload).digest("hex");

  return { token, expiresAt };
}

/**
 * Validates the moderation token against the reviewId, intended action, and expiration timestamp.
 * Uses constant-time buffer comparison to prevent timing attacks.
 */
export function verifyModerationToken(params: {
  reviewId: string | null | undefined;
  action: string | null | undefined;
  token: string | null | undefined;
  expiresAt: number | string | null | undefined;
}): boolean {
  if (!params.reviewId || !params.action || !params.token || !params.expiresAt) {
    return false;
  }

  if (params.action !== "approve" && params.action !== "reject") {
    return false;
  }

  const numericExpiresAt = Number(params.expiresAt);
  if (!Number.isFinite(numericExpiresAt) || Date.now() > numericExpiresAt) {
    return false; // Expired or invalid timestamp
  }

  try {
    const secret = getModerationSecret();
    const payload = `${params.reviewId}:${params.action}:${numericExpiresAt}`;
    const expectedToken = createHmac("sha256", secret).update(payload).digest("hex");

    const expectedBuf = Buffer.from(expectedToken, "hex");
    const actualBuf = Buffer.from(params.token, "hex");

    if (expectedBuf.length !== actualBuf.length || expectedBuf.length === 0) {
      return false;
    }

    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Atomically marks a moderation token as consumed to prevent replay attacks.
 * Uses Upstash Redis atomic SET with NX and EX flags if available,
 * falling back to in-memory atomic map tracking.
 */
export async function consumeModerationToken(
  token: string,
  expiresAt: number | string
): Promise<{ success: boolean; error?: string }> {
  if (!token || typeof token !== "string") {
    return { success: false, error: "Invalid token" };
  }

  const now = Date.now();
  const numericExpiresAt = Number(expiresAt);
  const remainingMs = Number.isFinite(numericExpiresAt) ? Math.max(1000, numericExpiresAt - now) : DEFAULT_EXPIRATION_MS;
  const ttlSec = Math.max(60, Math.ceil(remainingMs / 1000));

  // 1. Check local in-memory consumed tokens
  if (inMemoryConsumedTokens.has(token)) {
    const expiry = inMemoryConsumedTokens.get(token)!;
    if (expiry > now) {
      return { success: false, error: "This moderation token has already been consumed." };
    }
  }

  // 2. Atomic SET NX in Upstash Redis
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && redisToken) {
    try {
      const key = `consumed_mod_token:${token}`;
      const res = await fetch(`${url}/set/${encodeURIComponent(key)}/1/NX/EX/${ttlSec}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        method: "POST",
      });

      if (res.ok) {
        const data = (await res.json()) as { result: unknown };
        // If result is not "OK", the key already existed -> replay attempt
        if (data?.result !== "OK") {
          return { success: false, error: "This moderation link has already been used and is no longer valid." };
        }
      }
    } catch (err) {
      console.warn("[Moderation Token] Upstash Redis consumption notice:", err);
    }
  }

  // Record in-memory
  inMemoryConsumedTokens.set(token, now + remainingMs);

  return { success: true };
}
