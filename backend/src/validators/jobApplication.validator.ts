import { z } from 'zod';
import { APPLICATION_STATUSES, ApplicationStatus } from '../interfaces/job.interface';

export const applicationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const adminApplicationListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
  jobId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(255).optional(),
  status: z.enum(APPLICATION_STATUSES as unknown as [ApplicationStatus, ...ApplicationStatus[]]).optional(),
  pipeline: z.enum(['active', 'closed', 'all']).optional(),
  dateFrom: z.string().trim().min(1).optional(),
  dateTo: z.string().trim().min(1).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES as unknown as [ApplicationStatus, ...ApplicationStatus[]]),
  reason: z.string().trim().max(255).nullable().optional(),
});

export const applicationResumeQuerySchema = z.object({
  download: z
    .enum(['1', 'true', '0', 'false'])
    .optional()
    .transform((value) => value === '1' || value === 'true'),
});
