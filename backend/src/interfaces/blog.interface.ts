export type BlogStatus = 'draft' | 'published';

import { AuthorSummary } from './author.interface';

export type BlogCategoryRef = {
  id: number;
  name: string;
  slug: string;
};

/** Full row shape used inside repositories/services. */
export type BlogRecord = {
  id: number;
  heading: string;
  slug: string;
  shortDescription: string;
  body: string;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  status: BlogStatus;
  publishedAt: Date | null;
  categoryId: number;
  authorName: string;
  authors?: AuthorSummary[];
  createdByAdminId: number | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type PublicBlogSummary = {
  slug: string;
  heading: string;
  shortDescription: string;
  featuredImageUrl: string | null;
  authorName: string;
  authors?: AuthorSummary[];
  publishedAt: string | null;
  category: BlogCategoryRef;
  tags: string[];
};

export type BlogImageItem = {
  id: number;
  url: string;
  sortOrder: number;
};

export type PublicBlogDetail = PublicBlogSummary & {
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  /** Gallery image URLs (max 5). */
  images: string[];
};

export type AdminBlogDetail = Omit<PublicBlogDetail, 'images'> & {
  id: number;
  status: BlogStatus;
  categoryId: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  /** Gallery with ids for delete/replace APIs. */
  images: BlogImageItem[];
};

export type BlogShareLinks = {
  slug: string;
  pageUrl: string;
  linkedIn: string;
  whatsApp: string;
  x: string;
};

export type PublicBlogSort = 'latest' | 'oldest' | 'popular';

export type PublicBlogListFilters = {
  search?: string;
  categorySlug?: string;
  tagName?: string;
  authorSlug?: string;
  sort: PublicBlogSort;
};
