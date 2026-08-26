import { z } from 'zod';
import { JobStatus, WorkMode } from '../interfaces/job.interface';

const WorkModeEnum: [WorkMode, ...WorkMode[]] = ['On-site', 'Hybrid', 'Remote'];
const JobStatusEnum: [JobStatus, ...JobStatus[]] = ['draft', 'published', 'closed'];

export const adminJobListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
});

export const publicJobListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
});

export const jobIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const jobSlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  department: z.string().max(100).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  workMode: z.enum(WorkModeEnum),
  employmentType: z.string().max(100).nullable().optional(),
  experienceRequired: z.string().max(100).nullable().optional(),
  salaryCtc: z.string().max(100).nullable().optional(),
  numberOfOpenings: z.number().int().min(1).nullable().optional(),
  description: z
    .string()
    .trim()
    .min(1, 'Please enter the job description.')
    .min(20, 'Job description must be at least 20 characters.'),
  responsibilities: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  requiredSkills: z.string().nullable().optional(),
  status: z.enum(JobStatusEnum).default('draft'),
});

export const updateJobSchema = createJobSchema;

export const updateJobStatusSchema = z.object({
  status: z.enum(JobStatusEnum),
});

export const applyForJobSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters.')
    .max(255)
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, and basic punctuation'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(255)
    .regex(
      /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/,
      'Please enter a valid email address.',
    )
    .refine((value) => !value.includes('..'), {
      message: 'Please enter a valid email address.',
    }),
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  linkedinUrl: z.string().url('Invalid URL format').max(500).nullable().optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL format').max(500).nullable().optional().or(z.literal('')),
  currentCompany: z
    .string()
    .trim()
    .min(3, 'Please enter a valid current location.')
    .max(255),
  experienceYears: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      const text = String(val).trim();
      return text === '' ? undefined : text;
    },
    z
      .string({ error: 'Years of experience is required' })
      .regex(
        /^\d{1,2}(\.\d)?$/,
        'Enter years of experience with at most one decimal place.',
      )
      .refine((value) => {
        const n = Number(value);
        return Number.isFinite(n) && n >= 0 && n <= 80;
      }, 'Enter years of experience between 0 and 80.')
      .transform((value) => Number(value)),
  ),
});
