export interface ApiJob {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  employmentType: string | null;
  experienceRequired: string | null;
  salaryCtc: string | null;
  numberOfOpenings: number | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  requiredSkills: string | null;
  status: 'draft' | 'published' | 'closed';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

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
export type ApplicationPipeline = 'active' | 'closed' | 'all';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  selected: 'Selected',
  not_shortlisted: 'Not Shortlisted',
  withdrawn: 'Withdrawn',
  closed: 'Closed',
};

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

export interface ApiJobApplication {
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
}

export interface ApiJobApplicationStatusHistory {
  id: number;
  oldStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedByName: string | null;
  reason: string | null;
  changedAt: string;
}

export interface ApiJobApplicationDetail extends ApiJobApplication {
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  adminNotes: string | null;
  updatedAt: string;
  hasResume: boolean;
  statusHistory: ApiJobApplicationStatusHistory[];
}

export interface ApiJobApplicationJobHeader {
  id: number;
  title: string;
  slug: string;
  total: number;
}

export interface ApiJobApplicationSummary {
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  total: number;
  active: number;
  shortlisted: number;
  interview: number;
  selected: number;
}

export interface ApiJobListResponse {
  jobs: ApiJob[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiJobApplicationListResponse {
  applications: ApiJobApplication[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  job: ApiJobApplicationJobHeader | null;
}

export interface ApiJobApplicationSummariesResponse {
  summaries: ApiJobApplicationSummary[];
}
