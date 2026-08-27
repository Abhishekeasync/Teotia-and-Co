import { JobApplicationRepository, ApplicationListFilters } from '../repositories/jobApplication.repository';
import { JobRepository } from '../repositories/job.repository';
import {
  AdminJobApplication,
  AdminJobApplicationJobHeader,
  AdminJobApplicationListItem,
  AdminJobApplicationSummary,
  ApplicationStatus,
  isClosedApplicationStatus,
} from '../interfaces/job.interface';
import { PaginationParams, buildPaginationMeta, PaginationMeta } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../constants';
import { getPresignedResumeUrl, uploadResume } from '../utils/s3';
import { sendApplicationReceivedEmail, sendNewApplicationAdminNotification } from '../utils/mail';

export type CreateJobApplicationInput = {
  jobId: number;
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  currentCompany: string | null;
  experienceYears: number | null;
};

export type AdminApplicationListQuery = {
  jobId?: number;
  search?: string;
  status?: ApplicationStatus;
  pipeline?: 'active' | 'closed' | 'all';
  dateFrom?: string;
  dateTo?: string;
};

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function parseOptionalDate(value: string | undefined, endOfDay: boolean): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid date filter');
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (endOfDay) {
      parsed.setHours(23, 59, 59, 999);
    } else {
      parsed.setHours(0, 0, 0, 0);
    }
  }
  return parsed;
}

function toListItem(
  app: Awaited<ReturnType<JobApplicationRepository['listAll']>>[number],
): AdminJobApplicationListItem {
  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    jobSlug: app.jobSlug,
    name: app.name,
    email: app.email,
    phone: app.phone,
    currentCompany: app.currentCompany,
    experienceYears: app.experienceYears,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    closedAt: toIso(app.closedAt),
    closedByName: app.closedByName,
  };
}

export class JobApplicationService {
  private applicationRepository = new JobApplicationRepository();
  private jobRepository = new JobRepository();

  async apply(input: CreateJobApplicationInput, resumeFile: Express.Multer.File): Promise<{ message: string }> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job || job.status !== 'published') {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found or not accepting applications');
    }

    const hasApplied = await this.applicationRepository.hasApplied(
      input.jobId,
      input.email,
      input.phone,
    );
    if (hasApplied) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You have already applied for this job');
    }

    const resumeS3Key = await uploadResume(resumeFile);

    await this.applicationRepository.create({
      jobId: input.jobId,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      linkedinUrl: input.linkedinUrl,
      portfolioUrl: input.portfolioUrl,
      currentCompany: input.currentCompany,
      experienceYears: input.experienceYears,
      resumeS3Key,
    });

    sendApplicationReceivedEmail(input.email, input.name, job.title).catch((error) => {
      console.error('Failed to send applicant notification email:', error);
    });

    sendNewApplicationAdminNotification(job.title, input.name, input.email).catch((error) => {
      console.error('Failed to send admin notification email:', error);
    });

    return {
      message: 'Application submitted successfully',
    };
  }

  async listAdminApplications(
    pagination: PaginationParams,
    query: AdminApplicationListQuery,
  ): Promise<{
    applications: AdminJobApplicationListItem[];
    meta: PaginationMeta;
    job: AdminJobApplicationJobHeader | null;
  }> {
    const filters: ApplicationListFilters = {
      jobId: query.jobId,
      search: query.search,
      status: query.status,
      pipeline: query.status ? 'all' : (query.pipeline ?? 'active'),
      dateFrom: parseOptionalDate(query.dateFrom, false),
      dateTo: parseOptionalDate(query.dateTo, true),
    };

    const [applications, total, job] = await Promise.all([
      this.applicationRepository.listAll(pagination, filters),
      this.applicationRepository.countAll(filters),
      this.resolveJobHeader(query.jobId),
    ]);

    return {
      applications: applications.map(toListItem),
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
      job,
    };
  }

  async listJobSummaries(): Promise<{ summaries: AdminJobApplicationSummary[] }> {
    const summaries = await this.applicationRepository.listJobSummaries();
    return { summaries };
  }

  async getApplicationById(id: number): Promise<AdminJobApplication> {
    const app = await this.applicationRepository.findById(id);
    if (!app) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
    }

    const history = await this.applicationRepository.listStatusHistory(id);

    return {
      ...toListItem(app),
      linkedinUrl: app.linkedinUrl,
      portfolioUrl: app.portfolioUrl,
      adminNotes: app.adminNotes,
      updatedAt: app.updatedAt.toISOString(),
      hasResume: Boolean(app.resumeS3Key),
      statusHistory: history.map((entry) => ({
        id: entry.id,
        oldStatus: entry.oldStatus,
        newStatus: entry.newStatus,
        changedByName: entry.changedByName,
        reason: entry.reason,
        changedAt: entry.changedAt.toISOString(),
      })),
    };
  }

  async updateStatus(
    id: number,
    newStatus: ApplicationStatus,
    adminId: number,
    reason?: string | null,
  ): Promise<AdminJobApplication> {
    const app = await this.applicationRepository.findById(id);
    if (!app) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
    }

    if (app.status === newStatus) {
      return this.getApplicationById(id);
    }

    const fromClosed = isClosedApplicationStatus(app.status);
    const toClosed = isClosedApplicationStatus(newStatus);

    if (fromClosed && newStatus !== 'under_review') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Closed applications can only be reopened to Under Review',
      );
    }

    const closedAt = toClosed ? new Date() : null;
    const closedByAdminId = toClosed ? adminId : null;
    const resolvedReason =
      reason ??
      (fromClosed && newStatus === 'under_review'
        ? 'Reopened'
        : newStatus === 'not_shortlisted'
          ? 'Marked as not shortlisted'
          : null);

    const previous = await this.applicationRepository.updateStatus({
      id,
      newStatus,
      adminId,
      reason: resolvedReason,
      closedAt,
      closedByAdminId,
    });

    if (!previous) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
    }

    return this.getApplicationById(id);
  }

  async deleteApplication(id: number): Promise<void> {
    const app = await this.applicationRepository.findById(id);
    if (!app) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
    }

    await this.applicationRepository.softDelete(id);
  }

  async updateAdminNotes(id: number, notes: string | null): Promise<void> {
    const app = await this.applicationRepository.findById(id);
    if (!app) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
    }
    await this.applicationRepository.updateAdminNotes(id, notes);
  }

  async getPresignedResumeUrl(
    id: number,
    download = false,
  ): Promise<{ url: string }> {
    const app = await this.applicationRepository.findById(id);
    if (!app) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
    }
    if (!app.resumeS3Key) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Resume is currently unavailable');
    }
    const url = await getPresignedResumeUrl(app.resumeS3Key, {
      download,
      filename: `${app.name.replace(/[^\w.\- ]+/g, '').trim() || 'resume'}.pdf`,
    });
    return { url };
  }

  private async resolveJobHeader(jobId?: number): Promise<AdminJobApplicationJobHeader | null> {
    if (!jobId) return null;
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }
    const total = await this.applicationRepository.countByJob(jobId);
    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
      total,
    };
  }
}
