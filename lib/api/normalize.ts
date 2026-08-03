/**
 * Normalizes raw backend blog payloads into the frontend ApiBlog shape.
 * The API returns nested category objects and string[] tags; the UI expects flat fields.
 */

import { ApiAuthor, ApiBlog, ApiRelatedPost } from './types';

type RawCategory = { id: number; name: string; slug: string };

type RawAuthor = {
  id?: number;
  name?: string;
  slug?: string;
  designation?: string | null;
  profileImageUrl?: string | null;
};

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
  publishType?: 'draft' | 'publish_now' | 'scheduled';
  scheduledPublishAt?: string | null;
  schedulerStatus?: 'pending' | 'published' | 'failed' | 'cancelled' | null;
  publishedAt?: string | null;
  category?: RawCategory;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  tags?: unknown;
  authorName?: string;
  authors?: RawAuthor[];
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  images?: string[] | RawGalleryImage[];
  galleryImages?: RawGalleryImage[];
  relatedPosts?: Array<{
    id?: number;
    slug?: string;
    heading?: string;
    shortDescription?: string;
    featuredImageUrl?: string | null;
    publishedAt?: string | null;
    status?: 'draft' | 'published';
    category?: RawCategory;
    categoryName?: string;
  }>;
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

function normalizeAuthors(authors: RawApiBlog['authors']): ApiAuthor[] | undefined {
  if (!Array.isArray(authors) || authors.length === 0) return undefined;

  const normalized = authors
    .map((author) => {
      if (!author?.id || !author.name || !author.slug) return null;
      return {
        id: author.id,
        name: author.name,
        slug: author.slug,
        designation: author.designation ?? null,
        profileImageUrl: author.profileImageUrl ?? null,
      };
    })
    .filter((author): author is ApiAuthor => author !== null);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeRelatedPosts(relatedPosts: RawApiBlog['relatedPosts']): ApiRelatedPost[] {
  if (!Array.isArray(relatedPosts)) return [];

  return relatedPosts
    .map((post) => {
      if (!post?.id || !post.slug || !post.heading) return null;
      const category = post.category;
      return {
        id: post.id,
        slug: post.slug,
        heading: post.heading,
        shortDescription: post.shortDescription ?? '',
        featuredImageUrl: post.featuredImageUrl ?? null,
        publishedAt: post.publishedAt ?? null,
        category: {
          id: category?.id ?? 0,
          name: category?.name ?? post.categoryName ?? 'Uncategorized',
          slug: category?.slug ?? '',
        },
        ...(post.status ? { status: post.status } : {}),
      };
    })
    .filter((post): post is ApiRelatedPost => post !== null);
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
    publishType: raw.publishType ?? 'draft',
    scheduledPublishAt: raw.scheduledPublishAt ?? null,
    schedulerStatus: raw.schedulerStatus ?? null,
    publishedAt: raw.publishedAt ?? null,
    categoryId: category?.id ?? raw.categoryId ?? 0,
    categoryName: category?.name ?? raw.categoryName ?? 'Uncategorized',
    categorySlug: category?.slug ?? raw.categorySlug ?? '',
    tags: normalizeTagNames(raw.tags),
    authorName: raw.authorName ?? 'TEOTIA & CO.',
    authors: normalizeAuthors(raw.authors),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    viewCount: raw.viewCount,
    galleryImages: normalizeGalleryImages(raw.images, raw.galleryImages),
    relatedPosts: normalizeRelatedPosts(raw.relatedPosts),
  };
}

export function normalizeApiBlogs(rawBlogs: RawApiBlog[]): ApiBlog[] {
  return rawBlogs.map(normalizeApiBlog);
}
