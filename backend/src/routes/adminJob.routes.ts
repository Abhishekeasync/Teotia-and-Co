import { Router } from 'express';
import {
  createJob,
  deleteJob,
  getAdminJob,
  listAdminJobs,
  updateJob,
  updateJobStatus,
} from '../controllers/adminJob.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  adminJobListQuerySchema,
  createJobSchema,
  jobIdParamSchema,
  updateJobSchema,
  updateJobStatusSchema,
} from '../validators/job.validator';

const adminJobRouter = Router();

adminJobRouter.use(requireAuth);

adminJobRouter.get(
  '/list-all-jobs',
  validate(adminJobListQuerySchema, 'query'),
  listAdminJobs,
);

adminJobRouter.get(
  '/job-detail/:id',
  validate(jobIdParamSchema, 'params'),
  getAdminJob,
);

adminJobRouter.post(
  '/create-job',
  validate(createJobSchema, 'body'),
  createJob,
);

adminJobRouter.put(
  '/update-job/:id',
  validate(jobIdParamSchema, 'params'),
  validate(updateJobSchema, 'body'),
  updateJob,
);

adminJobRouter.patch(
  '/update-job-status/:id',
  validate(jobIdParamSchema, 'params'),
  validate(updateJobStatusSchema, 'body'),
  updateJobStatus,
);

adminJobRouter.delete(
  '/delete-job/:id',
  validate(jobIdParamSchema, 'params'),
  deleteJob,
);

export default adminJobRouter;
