/**
 * HTML Sanitization Utility
 * Sanitizes blog content HTML to prevent XSS attacks.
 *
 * Uses isomorphic-dompurify on the server. jsdom is pinned in package.json
 * overrides because jsdom@28+ breaks on Vercel's CommonJS serverless runtime.
 */

import DOMPurify from 'isomorphic-dompurify';

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'mark',
    'small',
    'del',
    'ins',
    'sub',
    'sup',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'blockquote',
    'code',
    'pre',
    'div',
    'span',
    'hr',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  ALLOWED_ATTR: [
    'href',
    'src',
    'alt',
    'title',
    'class',
    'style',
    'target',
    'rel',
    'id',
    'loading',
  ],
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
} ;

function stripDangerousMarkup(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Sanitize HTML content for safe rendering in the browser.
 * Allows common blog formatting tags while blocking dangerous scripts.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  const input = dirty ?? '';
  if (!input) return '';

  try {
    return DOMPurify.sanitize(input, SANITIZE_OPTIONS);
  } catch (error) {
    console.error('DOMPurify sanitization failed, using fallback strip:', error);
    return stripDangerousMarkup(input);
  }
}

/**
 * Extract plain text from HTML for meta descriptions, excerpts, etc.
 */
export function stripHtml(html: string): string {
  try {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return stripDangerousMarkup(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Truncate HTML content to a specific length while preserving tags.
 */
export function truncateHtml(html: string, maxLength: number): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) {
    return html;
  }

  const truncated = text.substring(0, maxLength);
  return truncated + '...';
}
