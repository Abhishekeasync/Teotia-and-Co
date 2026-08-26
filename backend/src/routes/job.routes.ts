import { Router } from 'express';
import multer from 'multer';
import { applyForJob, getPublicJob, listPublicJobs } from '../controllers/job.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  applyForJobSchema,
  jobIdParamSchema,
  jobSlugParamSchema,
  publicJobListQuerySchema,
} from '../validators/job.validator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const jobRouter = Router();

jobRouter.get(
  '/',
  validate(publicJobListQuerySchema, 'query'),
  listPublicJobs,
);

jobRouter.get(
  '/:slug',
  validate(jobSlugParamSchema, 'params'),
  getPublicJob,
);

jobRouter.post(
  '/:id/apply',
  upload.single('resume'),
  validate(jobIdParamSchema, 'params'),
  validate(applyForJobSchema, 'body'),
  applyForJob,
);

export default jobRouter;
