/**
 * Convert an arbitrary string into a URL-safe slug.
 * Handles accents, whitespace, and repeated separators.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** True when the string is a valid DNS-compatible subdomain label. */
export function isValidSubdomain(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value) && value.length <= 63;
}

/**
 * Ensure a slug is unique within a set of existing slugs by appending
 * an incrementing numeric suffix (e.g. "about", "about-2", "about-3").
 */
export function uniqueSlug(base: string, existing: Iterable<string>): string {
  const taken = new Set(existing);
  const root = slugify(base) || 'page';
  if (!taken.has(root)) return root;
  let i = 2;
  while (taken.has(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
}
