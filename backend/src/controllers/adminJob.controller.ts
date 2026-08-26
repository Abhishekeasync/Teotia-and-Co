import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { HTTP_STATUS } from '../constants';
import { parsePaginationQuery } from '../utils/pagination';

const jobService = new JobService();

export const createJob = async (req: Request, res: Response) => {
  const result = await jobService.createJob({
    ...req.body,
    adminId: req.admin!.id,
  });
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: result });
};

export const updateJob = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await jobService.updateJob(id, req.body);
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Job updated' });
};

export const updateJobStatus = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await jobService.updateJobStatus(id, req.body.status);
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Job status updated' });
};

export const deleteJob = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await jobService.deleteJob(id);
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Job deleted' });
};

export const listAdminJobs = async (req: Request, res: Response) => {
  const pagination = parsePaginationQuery(req.query);
  const result = await jobService.listAdminJobs(pagination);
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};

export const getAdminJob = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await jobService.getAdminJobById(id);
  res.status(HTTP_STATUS.OK).json({ success: true, data: result });
};
