import { z } from 'zod';
import { MAX_BLOG_IMAGES } from '../constants';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === undefined || value === null ? undefined : value;

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.union([z.url(), z.null()]).optional(),
);

const optionalNullableUrl = z.preprocess(
  emptyToUndefined,
  z.union([z.url(), z.null()]).optional(),
);

const optionalNullableString = (max?: number) =>
  z.preprocess(
    emptyToUndefined,
    (max ? z.string().trim().max(max) : z.string().trim()).nullable().optional(),
  );

/** Form-data may send arrays as JSON string, CSV, or real arrays. */
function stringArrayPreprocess(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return undefined;
    if (raw.startsWith('[')) {
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return raw.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }
    return raw.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return value;
}

const tagNamesSchema = z.preprocess(
  stringArrayPreprocess,
  z.array(z.string().trim().min(1).max(100)).max(50).optional(),
);

const imageUrlsSchema = z.preprocess(
  stringArrayPreprocess,
  z.array(z.url()).max(MAX_BLOG_IMAGES).optional(),
);

export const createBlogBodySchema = z.object({
  heading: z.string().trim().min(1).max(500),
  shortDescription: z.string().trim().min(1),
  body: z.string().min(1),
  categoryId: z.coerce.number().int().positive(),
  tagNames: tagNamesSchema,
  authorName: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(255).optional(),
  ),
  featuredImageUrl: optionalNullableUrl,
  metaTitle: optionalNullableString(500),
  metaDescription: optionalNullableString(),
  canonicalUrl: optionalUrl,
  ogImageUrl: optionalNullableUrl,
  imageUrls: imageUrlsSchema,
});

export const updateBlogBodySchema = createBlogBodySchema.partial();

export const blogIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const blogImageParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  imageId: z.coerce.number().int().positive(),
});

export const blogSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(520),
});

export const publicBlogListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().max(120).optional(),
  tag: z.string().trim().max(100).optional(),
  sort: z.enum(['latest', 'oldest', 'popular']).optional().default('latest'),
});

export const adminBlogListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
});
