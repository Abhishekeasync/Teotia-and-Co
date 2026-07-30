/**
 * HTML Sanitization Utility
 * Sanitizes blog content HTML to prevent XSS attacks
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content for safe rendering in the browser.
 * Allows common blog formatting tags while blocking dangerous scripts.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      // Text formatting
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
      // Headings
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      // Lists
      'ul',
      'ol',
      'li',
      // Links and media
      'a',
      'img',
      // Quotes and code
      'blockquote',
      'code',
      'pre',
      // Layout
      'div',
      'span',
      'hr',
      // Tables (if needed)
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
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Extract plain text from HTML for meta descriptions, excerpts, etc.
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
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
