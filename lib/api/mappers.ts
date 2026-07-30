/**
 * Mappers to convert API responses to frontend types
 * Bridges the gap between backend API and existing UI components
 */

import { BlogPost } from '../blog-posts';
import { ApiBlog } from './types';
import { normalizeTagNames } from './normalize';

/**
 * Calculate approximate read time from HTML content.
 * Assumes average reading speed of 200 words per minute.
 */
function calculateReadTime(html: string | null | undefined): string {
  if (!html) return '1 min read';
  
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(word => word.length > 0).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

/**
 * Format date string to display format.
 * Example: "2026-07-30T05:30:00.000Z" -> "Jul 30"
 */
function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Recent';
  
  const date = new Date(isoString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

/**
 * Convert API blog to frontend BlogPost type.
 * Maps backend field names to frontend expectations.
 */
export function mapApiBlogToPost(apiBlog: ApiBlog): BlogPost {
  return {
    slug: apiBlog.slug || '',
    title: apiBlog.heading || 'Untitled',
    excerpt: apiBlog.shortDescription || '',
    content: [apiBlog.shortDescription || '', apiBlog.body || ''],
    image: apiBlog.featuredImageUrl || '/assets/images/placeholder.jpg',
    author: apiBlog.authorName || 'TEOTIA & CO.',
    authorAvatar: '/assets/images/static.wixstatic.com/d8ab7d3a-12ec-4da4-96ad-a9761e57c1f0_edited-4fa8dd2ff7.png',
    date: formatDate(apiBlog.publishedAt || apiBlog.createdAt),
    readTime: calculateReadTime(apiBlog.body),
    category: apiBlog.categoryName || 'Uncategorized',
    tags: normalizeTagNames(apiBlog.tags),
  };
}

/**
 * Convert array of API blogs to frontend BlogPost array.
 */
export function mapApiBlogsToPost(apiBlogs: ApiBlog[]): BlogPost[] {
  return apiBlogs.map(mapApiBlogToPost);
}
