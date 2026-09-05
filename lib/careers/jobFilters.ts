import { ApiJob } from '@/lib/api/types';

export const JOB_TYPE_OPTIONS = [
  'Internship',
  'Apprenticeship',
  'Full-time',
  'Part-time',
  'Contract',
  'Articleship',
] as const;

export const LOCATION_OPTIONS = ['Delhi NCR', 'Noida'] as const;

export const EXPERIENCE_OPTIONS = [
  'Fresher',
  '0-1 Years',
  '1-3 Years',
  '3-5 Years',
  '5-10 Years',
  '10+ Years'
] as const;

export const WORK_MODE_OPTIONS = ['On-site', 'Hybrid', 'Remote'] as const;

export type JobTypeOption = (typeof JOB_TYPE_OPTIONS)[number];
export type LocationOption = (typeof LOCATION_OPTIONS)[number];
export type ExperienceOption = (typeof EXPERIENCE_OPTIONS)[number];
export type WorkModeOption = (typeof WORK_MODE_OPTIONS)[number];

export type JobFilters = {
  employmentType?: JobTypeOption;
  location?: LocationOption;
  experience?: ExperienceOption;
  workMode?: WorkModeOption;
};

export type JobFilterOptions = {
  employmentTypes: JobTypeOption[];
  locations: LocationOption[];
  experiences: ExperienceOption[];
  workModes: WorkModeOption[];
};

export const JOB_FILTER_PARAMS = {
  employmentType: 'type',
  location: 'location',
  experience: 'experience',
  workMode: 'mode',
} as const;

const ALL_FILTER_OPTIONS: JobFilterOptions = {
  employmentTypes: [...JOB_TYPE_OPTIONS],
  locations: [...LOCATION_OPTIONS],
  experiences: [...EXPERIENCE_OPTIONS],
  workModes: [...WORK_MODE_OPTIONS],
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function matchesLocationFilter(job: ApiJob, location: LocationOption): boolean {
  const text = normalizeText(job.location);
  if (!text) return false;

  if (location === 'Noida') {
    return /\bnoida\b/i.test(text);
  }

  return (
    /\bdelhi\b/i.test(text) ||
    /\bncr\b/i.test(text) ||
    /\bgurgaon\b/i.test(text) ||
    /\bgurugram\b/i.test(text) ||
    /\bfaridabad\b/i.test(text) ||
    /\bghaziabad\b/i.test(text)
  );
}

function parseExperienceYears(text: string): { min: number; max: number } | null {
  if (/\bfresher\b/i.test(text) || /\bentry[\s-]?level\b/i.test(text) || /\bno\s+experience\b/i.test(text)) {
    return { min: 0, max: 0 };
  }

  const rangeMatch = text.match(/(\d+)\s*(?:[-–]|to)\s*(\d+)/i);
  if (rangeMatch) {
    return {
      min: Number(rangeMatch[1]),
      max: Number(rangeMatch[2]),
    };
  }

  const plusMatch = text.match(/(\d+)\s*\+/i);
  if (plusMatch) {
    return { min: Number(plusMatch[1]), max: Number.POSITIVE_INFINITY };
  }

  const singleMatch = text.match(/(\d+)\s*(?:year|yr)s?/i);
  if (singleMatch) {
    const years = Number(singleMatch[1]);
    return { min: years, max: years };
  }

  return null;
}

function experienceRangeOverlaps(
  jobRange: { min: number; max: number },
  bucketMin: number,
  bucketMax: number,
): boolean {
  const jobMax = Number.isFinite(jobRange.max) ? jobRange.max : jobRange.min;
  return jobRange.min <= bucketMax && jobMax >= bucketMin;
}

function matchesExperienceFilter(job: ApiJob, experience: ExperienceOption): boolean {
  const text = normalizeText(job.experienceRequired);
  if (!text) return experience === 'Fresher';

  const parsed = parseExperienceYears(text);
  if (parsed) {
    switch (experience) {
      case 'Fresher':
        return parsed.min === 0 && parsed.max === 0;
      case '0-1 Years':
        return experienceRangeOverlaps(parsed, 0, 1);
      case '1-3 Years':
        return experienceRangeOverlaps(parsed, 1, 3);
      case '3-5 Years':
        return experienceRangeOverlaps(parsed, 3, 5);
      case '5-10 Years':
        return experienceRangeOverlaps(parsed, 5, 10);
      case '10+ Years':
        return parsed.min >= 10 || parsed.max >= 10;
      default:
        return false;
    }
  }

  switch (experience) {
    case 'Fresher':
      return (
        /\bfresher\b/i.test(text) ||
        /\bentry[\s-]?level\b/i.test(text) ||
        /\bno\s+experience\b/i.test(text)
      );
    case '0-1 Years':
      return /\b0\s*[-–]\s*1\b/i.test(text) || /\b0\s*to\s*1\b/i.test(text);
    case '1-3 Years':
      return /\b1\s*[-–]\s*3\b/i.test(text) || /\b1\s*to\s*3\b/i.test(text);
    case '3-5 Years':
      return (
        /\b3\s*[-–]\s*5\b/i.test(text) ||
        /\b3\s*to\s*5\b/i.test(text) ||
        /\b3\s*(?:year|yr)s?\b/i.test(text) ||
        /\b4\s*(?:year|yr)s?\b/i.test(text) ||
        /\b5\s*(?:year|yr)s?\b/i.test(text)
      );
    case '5-10 Years':
      return (
        /\b5\s*[-–]\s*10\b/i.test(text) ||
        /\b5\s*to\s*10\b/i.test(text) ||
        /\b[5-9]\s*(?:year|yr)s?\b/i.test(text) ||
        /\b10\s*(?:year|yr)s?\b/i.test(text)
      );
    case '10+ Years':
      return (
        /\b10\s*\+/i.test(text) ||
        /\b1[1-9]\d?\s*(?:year|yr)s?\b/i.test(text) ||
        /\bmore\s+than\s+10\b/i.test(text)
      );
    default:
      return false;
  }
}

function matchesEmploymentTypeFilter(job: ApiJob, employmentType: JobTypeOption): boolean {
  return normalizeText(job.employmentType) === normalizeText(employmentType);
}

function matchesWorkModeFilter(job: ApiJob, workMode: WorkModeOption): boolean {
  return job.workMode === workMode;
}

export function parseJobFilters(searchParams: Pick<URLSearchParams, 'get'>): JobFilters {
  const employmentType = searchParams.get(JOB_FILTER_PARAMS.employmentType)?.trim();
  const location = searchParams.get(JOB_FILTER_PARAMS.location)?.trim();
  const experience = searchParams.get(JOB_FILTER_PARAMS.experience)?.trim();
  const workMode = searchParams.get(JOB_FILTER_PARAMS.workMode)?.trim();
  const legacyDepartment = searchParams.get('department')?.trim();

  const filters: JobFilters = {};

  if (employmentType && (JOB_TYPE_OPTIONS as readonly string[]).includes(employmentType)) {
    filters.employmentType = employmentType as JobTypeOption;
  }
  if (location && (LOCATION_OPTIONS as readonly string[]).includes(location)) {
    filters.location = location as LocationOption;
  }
  if (experience && (EXPERIENCE_OPTIONS as readonly string[]).includes(experience)) {
    filters.experience = experience as ExperienceOption;
  }

  const resolvedWorkMode = workMode || legacyDepartment;
  if (resolvedWorkMode && (WORK_MODE_OPTIONS as readonly string[]).includes(resolvedWorkMode)) {
    filters.workMode = resolvedWorkMode as WorkModeOption;
  }

  return filters;
}

export function hasActiveJobFilters(filters: JobFilters): boolean {
  return Boolean(
    filters.employmentType || filters.location || filters.experience || filters.workMode,
  );
}

export function jobFiltersToQueryString(filters: JobFilters): string {
  const params = new URLSearchParams();
  if (filters.employmentType) {
    params.set(JOB_FILTER_PARAMS.employmentType, filters.employmentType);
  }
  if (filters.location) {
    params.set(JOB_FILTER_PARAMS.location, filters.location);
  }
  if (filters.experience) {
    params.set(JOB_FILTER_PARAMS.experience, filters.experience);
  }
  if (filters.workMode) {
    params.set(JOB_FILTER_PARAMS.workMode, filters.workMode);
  }
  return params.toString();
}

export function getJobFilterOptions(jobs: ApiJob[]): JobFilterOptions {
  if (jobs.length === 0) {
    return {
      employmentTypes: [],
      locations: [],
      experiences: [],
      workModes: [],
    };
  }

  return { ...ALL_FILTER_OPTIONS };
}

export function filterJobs(jobs: ApiJob[], filters: JobFilters): ApiJob[] {
  return jobs.filter((job) => {
    if (filters.employmentType && !matchesEmploymentTypeFilter(job, filters.employmentType)) {
      return false;
    }
    if (filters.location && !matchesLocationFilter(job, filters.location)) {
      return false;
    }
    if (filters.experience && !matchesExperienceFilter(job, filters.experience)) {
      return false;
    }
    if (filters.workMode && !matchesWorkModeFilter(job, filters.workMode)) {
      return false;
    }
    return true;
  });
}

export function sanitizeJobFilters(
  filters: JobFilters,
  _options: JobFilterOptions,
): JobFilters {
  const next: JobFilters = {};

  if (filters.employmentType && JOB_TYPE_OPTIONS.includes(filters.employmentType)) {
    next.employmentType = filters.employmentType;
  }
  if (filters.location && LOCATION_OPTIONS.includes(filters.location)) {
    next.location = filters.location;
  }
  if (filters.experience && EXPERIENCE_OPTIONS.includes(filters.experience)) {
    next.experience = filters.experience;
  }
  if (filters.workMode && WORK_MODE_OPTIONS.includes(filters.workMode)) {
    next.workMode = filters.workMode;
  }

  return next;
}

export function countActiveJobFilterFields(filters: JobFilters): number {
  return [
    filters.employmentType,
    filters.location,
    filters.experience,
    filters.workMode,
  ].filter(Boolean).length;
}

/** @deprecated Use getJobFilterOptions */
export function extractJobFilterOptions(jobs: ApiJob[]): JobFilterOptions {
  return getJobFilterOptions(jobs);
}
