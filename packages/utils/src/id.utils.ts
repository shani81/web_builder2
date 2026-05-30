/**
 * ID generation. Uses the platform Web Crypto API (available in Node 22+
 * and all modern browsers) so it works in both the API and the web app.
 */

/** Generate a UUID v4. */
export function uuid(): string {
  return crypto.randomUUID();
}

/**
 * Generate a short, URL-safe, prefixed id (e.g. "blk_a1b2c3d4").
 * Useful for block ids that appear in the DOM and editor state.
 */
export function shortId(prefix?: string): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    '',
  );
  return prefix ? `${prefix}_${body}` : body;
}
