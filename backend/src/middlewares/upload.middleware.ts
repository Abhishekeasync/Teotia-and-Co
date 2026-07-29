import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { MAX_BLOG_IMAGES, UPLOAD_MAX_BYTES } from '../constants';

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD_MAX_BYTES,
    files: MAX_BLOG_IMAGES,
  },
});

/**
 * Standalone multi-upload — up to 5 files.
 * Prefer field name `images` (repeat the key for each file in Postman).
 * Also accepts `image` for a single or multiple files.
 */
export const blogImagesUpload = memoryUpload.fields([
  { name: 'images', maxCount: MAX_BLOG_IMAGES },
  { name: 'image', maxCount: MAX_BLOG_IMAGES },
]);

/** Replace one gallery image — single file field `image`. */
export const blogSingleImageUpload = memoryUpload.single('image');

/**
 * Create/update blog via multipart/form-data.
 * Optional files:
 *   - `images` (up to 5) → gallery
 *   - `featuredImage` or `image` → featured (if `images` not used for the same files)
 *   - `ogImage` → Open Graph share image
 */
export const blogFormUpload = memoryUpload.fields([
  { name: 'images', maxCount: MAX_BLOG_IMAGES },
  { name: 'featuredImage', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'ogImage', maxCount: 1 },
]);

/**
 * Multipart sends every field as a string. Normalize before Zod:
 * - empty string → undefined (optional fields)
 * - tagNames JSON string / single string → string[]
 * - imageUrls JSON string → string[]
 */
export function normalizeBlogFormBody(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body as Record<string, unknown>;
  if (!body || typeof body !== 'object') {
    next();
    return;
  }

  for (const key of Object.keys(body)) {
    if (body[key] === '') {
      body[key] = undefined;
    }
  }

  for (const key of ['tagNames', 'imageUrls'] as const) {
    const value = body[key];
    if (typeof value !== 'string') {
      continue;
    }
    const raw = value.trim();
    if (!raw) {
      body[key] = undefined;
    } else if (raw.startsWith('[')) {
      try {
        body[key] = JSON.parse(raw) as unknown;
      } catch {
        body[key] = raw.split(',').map((t) => t.trim()).filter(Boolean);
      }
    } else {
      body[key] = raw.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  next();
}

export function pickUploadedFile(
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined,
  field: string,
): Express.Multer.File | undefined {
  if (!files || Array.isArray(files)) {
    return undefined;
  }
  return files[field]?.[0];
}

/** Collect gallery files from `images` and/or `image` fields (capped at MAX_BLOG_IMAGES). */
export function collectUploadedImages(
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined,
): Express.Multer.File[] {
  if (!files || Array.isArray(files)) {
    return [];
  }
  const fromImages = files.images ?? [];
  const fromImage = files.image ?? [];
  return [...fromImages, ...fromImage].slice(0, MAX_BLOG_IMAGES);
}
