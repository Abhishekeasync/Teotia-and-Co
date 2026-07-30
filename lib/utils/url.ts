/**
 * URL validation helpers for link insertion in the editor.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** Returns a normalized href or null if the value is not a safe, usable URL. */
export function normalizeEditorLinkUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withProtocol =
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function isValidEditorLinkUrl(input: string): boolean {
  return normalizeEditorLinkUrl(input) !== null;
}
