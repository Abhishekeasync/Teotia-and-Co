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
  description: z.string().min(1, 'Description is required'),
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
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').max(255),
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  linkedinUrl: z.string().url('Invalid URL format').max(500).nullable().optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL format').max(500).nullable().optional().or(z.literal('')),
  currentCompany: z.string().trim().min(1, 'Current location is required').max(255),
  experienceYears: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.coerce
      .number({ error: 'Years of experience is required' })
      .min(0, 'Years of experience must be 0 or more')
      .max(60, 'Years of experience must be 60 or less'),
  ),
});
