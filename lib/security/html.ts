import "server-only";

/**
 * Escapes characters with special meaning in HTML to prevent XSS and HTML injection.
 * Neutralizes: &, <, >, ", '
 */
export function escapeHtml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) return "";
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips newline and carriage return characters from single-line headers
 * (such as email subject, sender, or recipient) to prevent email header injection.
 */
export function sanitizeHeaderValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).replace(/[\r\n]+/g, " ").trim();
}
