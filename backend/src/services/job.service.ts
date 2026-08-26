import { JobRepository } from '../repositories/job.repository';
import { JobStatus, PublicJob, AdminJob, WorkMode } from '../interfaces/job.interface';
import { PaginationParams, buildPaginationMeta, PaginationMeta } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../constants';
import { slugify } from '../utils/slug';

export type CreateJobInput = {
  title: string;
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
  adminId: number;
};

export type UpdateJobInput = Omit<CreateJobInput, 'adminId'>;

export class JobService {
  private jobRepository = new JobRepository();

  async createJob(input: CreateJobInput): Promise<{ id: number; slug: string }> {
    let slug = slugify(input.title);
    
    // Ensure slug is unique
    let isTaken = await this.jobRepository.isSlugTaken(slug);
    let counter = 1;
    while (isTaken) {
      slug = `${slugify(input.title)}-${counter}`;
      isTaken = await this.jobRepository.isSlugTaken(slug);
      counter++;
    }

    const id = await this.jobRepository.create({
      title: input.title,
      slug,
      department: input.department,
      location: input.location,
      workMode: input.workMode,
      employmentType: input.employmentType,
      experienceRequired: input.experienceRequired,
      salaryCtc: input.salaryCtc,
      numberOfOpenings: input.numberOfOpenings,
      description: input.description,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      requiredSkills: input.requiredSkills,
      status: input.status,
      createdByAdminId: input.adminId,
    });

    return { id, slug };
  }

  async updateJob(id: number, input: UpdateJobInput): Promise<void> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    let slug = job.slug;
    // If title changed, update slug
    if (job.title !== input.title) {
      slug = slugify(input.title);
      let isTaken = await this.jobRepository.isSlugTaken(slug, id);
      let counter = 1;
      while (isTaken) {
        slug = `${slugify(input.title)}-${counter}`;
        isTaken = await this.jobRepository.isSlugTaken(slug, id);
        counter++;
      }
    }

    await this.jobRepository.update(id, {
      title: input.title,
      slug,
      department: input.department,
      location: input.location,
      workMode: input.workMode,
      employmentType: input.employmentType,
      experienceRequired: input.experienceRequired,
      salaryCtc: input.salaryCtc,
      numberOfOpenings: input.numberOfOpenings,
      description: input.description,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      requiredSkills: input.requiredSkills,
      status: input.status,
    });
  }

  async updateJobStatus(id: number, status: JobStatus): Promise<void> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }
    await this.jobRepository.updateStatus(id, status);
  }

  async deleteJob(id: number): Promise<void> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }
    await this.jobRepository.softDelete(id);
  }

  async listAdminJobs(pagination: PaginationParams): Promise<{ jobs: AdminJob[]; meta: PaginationMeta }> {
    const [jobs, total] = await Promise.all([
      this.jobRepository.listAll(pagination),
      this.jobRepository.countAll(),
    ]);

    const adminJobs: AdminJob[] = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      department: j.department,
      location: j.location,
      workMode: j.workMode,
      employmentType: j.employmentType,
      experienceRequired: j.experienceRequired,
      salaryCtc: j.salaryCtc,
      numberOfOpenings: j.numberOfOpenings,
      description: j.description,
      responsibilities: j.responsibilities,
      requirements: j.requirements,
      requiredSkills: j.requiredSkills,
      status: j.status,
      publishedAt: j.publishedAt?.toISOString() ?? null,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
    }));

    return {
      jobs: adminJobs,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async getAdminJobById(id: number): Promise<AdminJob> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
      department: job.department,
      location: job.location,
      workMode: job.workMode,
      employmentType: job.employmentType,
      experienceRequired: job.experienceRequired,
      salaryCtc: job.salaryCtc,
      numberOfOpenings: job.numberOfOpenings,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      requiredSkills: job.requiredSkills,
      status: job.status,
      publishedAt: job.publishedAt?.toISOString() ?? null,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }

  async listPublicJobs(pagination: PaginationParams): Promise<{ jobs: PublicJob[]; meta: PaginationMeta }> {
    const [jobs, total] = await Promise.all([
      this.jobRepository.listPublished(pagination),
      this.jobRepository.countPublished(),
    ]);

    const publicJobs: PublicJob[] = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      department: j.department,
      location: j.location,
      workMode: j.workMode,
      employmentType: j.employmentType,
      experienceRequired: j.experienceRequired,
      salaryCtc: j.salaryCtc,
      numberOfOpenings: j.numberOfOpenings,
      description: j.description,
      responsibilities: j.responsibilities,
      requirements: j.requirements,
      requiredSkills: j.requiredSkills,
      publishedAt: j.publishedAt!.toISOString(),
    }));

    return {
      jobs: publicJobs,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async getPublicJobBySlug(slug: string): Promise<PublicJob> {
    const job = await this.jobRepository.findBySlug(slug);
    if (!job || job.status !== 'published') {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
      department: job.department,
      location: job.location,
      workMode: job.workMode,
      employmentType: job.employmentType,
      experienceRequired: job.experienceRequired,
      salaryCtc: job.salaryCtc,
      numberOfOpenings: job.numberOfOpenings,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      requiredSkills: job.requiredSkills,
      publishedAt: job.publishedAt!.toISOString(),
    };
  }
}
