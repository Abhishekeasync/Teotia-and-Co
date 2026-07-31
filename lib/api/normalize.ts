/**
 * Normalizes raw backend blog payloads into the frontend ApiBlog shape.
 * The API returns nested category objects and string[] tags; the UI expects flat fields.
 */

import { ApiBlog } from './types';

type RawCategory = { id: number; name: string; slug: string };

type RawGalleryImage = {
  id: number;
  url?: string;
  imageUrl?: string;
  sortOrder?: number;
  displayOrder?: number;
};

export type RawApiBlog = {
  id?: number;
  heading?: string;
  slug?: string;
  shortDescription?: string;
  body?: string;
  featuredImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  status?: 'draft' | 'published';
  publishedAt?: string | null;
  category?: RawCategory;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  tags?: unknown;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  images?: string[] | RawGalleryImage[];
  galleryImages?: RawGalleryImage[];
};

/** Normalize tags whether the API sends string[] or { id, name }[]. */
export function normalizeTagNames(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => {
      if (typeof tag === 'string') return tag.trim();
      if (tag && typeof tag === 'object' && 'name' in tag) {
        return String((tag as { name: string }).name).trim();
      }
      return '';
    })
    .filter(Boolean);
}

function normalizeGalleryImages(
  images: RawApiBlog['images'],
  galleryImages: RawApiBlog['galleryImages']
): ApiBlog['galleryImages'] {
  const source = galleryImages ?? images;
  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => {
      if (typeof item === 'string') {
        return { id: index, imageUrl: item, displayOrder: index };
      }
      const row = item as RawGalleryImage;
      const url = row.url ?? row.imageUrl ?? '';
      if (!url) return null;
      return {
        id: row.id,
        imageUrl: url,
        displayOrder: row.sortOrder ?? row.displayOrder ?? index,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Map a single raw blog record from any API endpoint to ApiBlog. */
export function normalizeApiBlog(raw: RawApiBlog): ApiBlog {
  const category = raw.category;

  return {
    id: raw.id ?? 0,
    heading: raw.heading ?? '',
    slug: raw.slug ?? '',
    shortDescription: raw.shortDescription ?? '',
    body: raw.body ?? '',
    featuredImageUrl: raw.featuredImageUrl ?? null,
    metaTitle: raw.metaTitle ?? null,
    metaDescription: raw.metaDescription ?? null,
    canonicalUrl: raw.canonicalUrl ?? null,
    ogImageUrl: raw.ogImageUrl ?? null,
    status: raw.status ?? 'draft',
    publishedAt: raw.publishedAt ?? null,
    categoryId: category?.id ?? raw.categoryId ?? 0,
    categoryName: category?.name ?? raw.categoryName ?? 'Uncategorized',
    categorySlug: category?.slug ?? raw.categorySlug ?? '',
    tags: normalizeTagNames(raw.tags),
    authorName: raw.authorName ?? 'TEOTIA & CO.',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    viewCount: raw.viewCount,
    galleryImages: normalizeGalleryImages(raw.images, raw.galleryImages),
  };
}

export function normalizeApiBlogs(rawBlogs: RawApiBlog[]): ApiBlog[] {
  return rawBlogs.map(normalizeApiBlog);
}
