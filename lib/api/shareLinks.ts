import type { BlogShareLinksData } from '@/components/blog/BlogPostShare';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return DEFAULT_SITE_URL;
}

/** Build share URLs when the API is unavailable (SSR fallback). */
export function buildFallbackShareLinks(
  slug: string,
  heading: string
): BlogShareLinksData {
  const base = resolveSiteUrl();
  const pageUrl = `${base}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(`${heading} — ${pageUrl}`);

  return {
    pageUrl,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsApp: `https://wa.me/?text=${encodedText}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(heading)}`,
  };
}

export function normalizeShareLinks(raw: unknown, slug: string, heading: string): BlogShareLinksData {
  const share = (raw as { share?: Record<string, string> })?.share;
  if (!share?.pageUrl) {
    return buildFallbackShareLinks(slug, heading);
  }

  return {
    pageUrl: share.pageUrl,
    linkedIn: share.linkedIn ?? buildFallbackShareLinks(slug, heading).linkedIn,
    whatsApp: share.whatsApp ?? buildFallbackShareLinks(slug, heading).whatsApp,
    x: share.x ?? buildFallbackShareLinks(slug, heading).x,
  };
}
