import { z } from 'zod';

/** GET /admin/dashboard/recent - Optional limit parameter. */
export const dashboardRecentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});
