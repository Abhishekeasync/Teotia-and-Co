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

const booleanFormField = z.preprocess(
  (value) => {
    if (value === 'true' || value === true || value === '1' || value === 1) return true;
    if (value === 'false' || value === false || value === '0' || value === 0) return false;
    return undefined;
  },
  z.boolean().optional(),
);

const clearableProfileImageUrl = z.preprocess(
  (value) => {
    if (value === '' || value === 'null' || value === null) return null;
    return undefined;
  },
  z.null().optional(),
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

export const updateAuthorBodySchema = createAuthorBodySchema.partial().extend({
  removeProfileImage: booleanFormField,
  profileImageUrl: clearableProfileImageUrl,
});

export const authorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const authorSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(300),
});
