import { Request, Response } from 'express';
import { JobApplicationService } from '../services/jobApplication.service';
import { HTTP_STATUS } from '../constants';
import { parsePaginationQuery } from '../utils/pagination';
import { ApplicationStatus } from '../interfaces/job.interface';

const jobApplicationService = new JobApplicationService();

export const listAdminApplications = async (req: Request, res: Response) => {
  const pagination = parsePaginationQuery(req.query);
  const result = await jobApplicationService.listAdminApplications(pagination, {
    jobId: req.query.jobId ? Number(req.query.jobId) : undefined,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status: req.query.status as ApplicationStatus | undefined,
    pipeline: req.query.pipeline as 'active' | 'closed' | 'all' | undefined,
    dateFrom: typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined,
  });
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

export const listApplicationJobSummaries = async (_req: Request, res: Response) => {
  const result = await jobApplicationService.listJobSummaries();
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

export const getAdminApplication = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await jobApplicationService.getApplicationById(id);
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

export const updateAdminApplicationStatus = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await jobApplicationService.updateStatus(
    id,
    req.body.status,
    req.admin!.id,
    req.body.reason,
  );
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

export const deleteAdminApplication = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await jobApplicationService.deleteApplication(id);
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Application deleted' });
};

export const updateAdminNotes = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await jobApplicationService.updateAdminNotes(id, req.body.adminNotes ?? null);
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Notes updated' });
};

export const getApplicationResumeUrl = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const rawDownload = req.query.download as unknown;
  const download = rawDownload === true || rawDownload === '1' || rawDownload === 'true';
  const result = await jobApplicationService.getPresignedResumeUrl(id, download);
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};
