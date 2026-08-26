export type JobStatus = 'draft' | 'published' | 'closed';
export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';

export const APPLICATION_STATUSES = [
  'applied',
  'under_review',
  'shortlisted',
  'interview',
  'selected',
  'not_shortlisted',
  'withdrawn',
  'closed',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'under_review',
  'shortlisted',
  'interview',
];

export const CLOSED_APPLICATION_STATUSES: ApplicationStatus[] = [
  'selected',
  'not_shortlisted',
  'withdrawn',
  'closed',
];

export function isClosedApplicationStatus(status: ApplicationStatus): boolean {
  return (CLOSED_APPLICATION_STATUSES as string[]).includes(status);
}

export type JobRecord = {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  workMode: WorkMode;
  employmentType: string | null;
  experienceRequired: string | null;
  salaryCtc: string | null;
  numberOfOpenings: number | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  requiredSkills: string | null;
  status: JobStatus;
  createdByAdminId: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type JobApplicationRecord = {
  id: number;
  jobId: number;
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  currentCompany: string | null;
  experienceYears: number | null;
  resumeS3Key: string;
  adminNotes: string | null;
  status: ApplicationStatus;
  closedAt: Date | null;
  closedByAdminId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type JobApplicationStatusHistoryRecord = {
  id: number;
  applicationId: number;
  oldStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedByAdminId: number | null;
  changedByName: string | null;
  reason: string | null;
  changedAt: Date;
};

export type PublicJob = {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  workMode: WorkMode;
  employmentType: string | null;
  experienceRequired: string | null;
  salaryCtc: string | null;
  numberOfOpenings: number | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  requiredSkills: string | null;
  publishedAt: string;
};

export type AdminJob = {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  workMode: WorkMode;
  employmentType: string | null;
  experienceRequired: string | null;
  salaryCtc: string | null;
  numberOfOpenings: number | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  requiredSkills: string | null;
  status: JobStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminJobApplicationListItem = {
  id: number;
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  name: string;
  email: string;
  phone: string;
  currentCompany: string | null;
  experienceYears: number | null;
  status: ApplicationStatus;
  createdAt: string;
  closedAt: string | null;
  closedByName: string | null;
};

export type AdminJobApplication = AdminJobApplicationListItem & {
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  adminNotes: string | null;
  updatedAt: string;
  hasResume: boolean;
  statusHistory: Array<{
    id: number;
    oldStatus: ApplicationStatus | null;
    newStatus: ApplicationStatus;
    changedByName: string | null;
    reason: string | null;
    changedAt: string;
  }>;
};

export type AdminJobApplicationSummary = {
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  total: number;
  active: number;
  shortlisted: number;
  interview: number;
  selected: number;
};

export type AdminJobApplicationJobHeader = {
  id: number;
  title: string;
  slug: string;
  total: number;
};
