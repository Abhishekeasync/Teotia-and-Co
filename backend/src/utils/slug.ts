/** URL-safe slug for categories (and later blog headings). */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Lowercase tag label without leading # — used for unique tag names in DB. */
export function normalizeTagName(name: string): string {
  return name.trim().replace(/^#+/, '').toLowerCase();
}
