/** URL-safe slug for categories (and blog headings). */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Append -2, -3, … until slugIsAvailable returns true. */
export async function uniqueSlugFromHeading(
  heading: string,
  slugIsAvailable: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(heading);
  if (!base) {
    throw new Error('Heading must produce a valid slug');
  }
  let candidate = base;
  let suffix = 2;
  while (!(await slugIsAvailable(candidate))) {
    const tail = `-${suffix}`;
    candidate = `${base.slice(0, Math.max(1, 120 - tail.length))}${tail}`;
    suffix += 1;
  }
  return candidate;
}

/** Lowercase tag label without leading # — used for unique tag names in DB. */
export function normalizeTagName(name: string): string {
  return name.trim().replace(/^#+/, '').toLowerCase();
}
