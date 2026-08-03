import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === undefined || value === null ? undefined : value;

const optionalNullableString = (max?: number) =>
  z.preprocess(
    emptyToUndefined,
    (max ? z.string().trim().max(max) : z.string().trim()).nullable().optional(),
  );

const optionalNullableUrl = z.preprocess(
  emptyToUndefined,
  z.union([z.url(), z.null()]).optional(),
);

export const createAuthorBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  designation: optionalNullableString(255),
  bio: optionalNullableString(),
  facebookUrl: optionalNullableUrl,
  twitterUrl: optionalNullableUrl,
  linkedinUrl: optionalNullableUrl,
  // profileImageUrl will be populated by the file upload middleware if provided
});

export const updateAuthorBodySchema = createAuthorBodySchema.partial();

export const authorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const authorSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(300),
});
