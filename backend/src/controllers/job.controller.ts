import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { JobApplicationService } from '../services/jobApplication.service';
import { HTTP_STATUS } from '../constants';
import { parsePaginationQuery } from '../utils/pagination';

const jobService = new JobService();
const jobApplicationService = new JobApplicationService();

export const listPublicJobs = async (req: Request, res: Response) => {
  const pagination = parsePaginationQuery(req.query);
  const result = await jobService.listPublicJobs(pagination);
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

export const getPublicJob = async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const result = await jobService.getPublicJobBySlug(slug);
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

export const applyForJob = async (req: Request, res: Response) => {
  const jobId = Number(req.params.id);
  const result = await jobApplicationService.apply(
    { ...req.body, jobId },
    req.file!,
  );
  res.status(HTTP_STATUS.CREATED).json({ success: true, ...result });
};
