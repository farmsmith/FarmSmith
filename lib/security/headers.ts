import "server-only";

/**
 * Standard security headers applied to API responses.
 *
 * Content-Security-Policy is deliberately NOT set here yet. Razorpay's
 * checkout widget needs specific allowances (script-src, frame-src,
 * connect-src pointed at checkout.razorpay.com and api.razorpay.com) —
 * a copy-pasted generic CSP would either be too loose to matter or break
 * the payment widget outright. We'll add a correctly-scoped CSP once the
 * frontend wires up the Razorpay widget, so we know exactly which
 * domains it actually needs.
 */
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
};

export function withSecurityHeaders(headers: HeadersInit = {}): Headers {
  const h = new Headers(headers);
  for (const [key, value] of Object.entries(securityHeaders)) {
    h.set(key, value);
  }
  return h;
}
