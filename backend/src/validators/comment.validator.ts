import { z } from 'zod';

/** POST /blogs/:slug/comments - Submit a comment. */
export const createCommentBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().email().toLowerCase(),
  comment: z.string().trim().min(1).max(2000),
});

/** GET /blogs/:slug/comments - List comments (pagination). */
export const commentListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
});

/** GET /admin/comments - Admin list with status filter. */
export const adminCommentListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

/** :id param for comment operations. */
export const commentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
