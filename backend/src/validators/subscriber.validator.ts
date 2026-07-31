import { z } from 'zod';

/** POST /subscribers - Subscribe to newsletter. */
export const subscribeBodySchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().trim().min(1).max(255).optional(),
});

/** POST /subscribers/unsubscribe - Unsubscribe via token (body). */
export const unsubscribeBodySchema = z.object({
  token: z.string().uuid(),
});

/** GET /subscribers/unsubscribe - Unsubscribe via token (query). */
export const unsubscribeQuerySchema = z.object({
  token: z.string().uuid(),
});

/** GET /admin/subscribers - Admin list (pagination). */
export const adminSubscriberListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
});

/** :id param for subscriber operations. */
export const subscriberIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
