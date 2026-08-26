import { Router } from 'express';
import {
  deleteAdminApplication,
  getAdminApplication,
  getApplicationResumeUrl,
  listAdminApplications,
  listApplicationJobSummaries,
  updateAdminApplicationStatus,
  updateAdminNotes,
} from '../controllers/adminJobApplication.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  adminApplicationListQuerySchema,
  applicationIdParamSchema,
  applicationResumeQuerySchema,
  updateApplicationStatusSchema,
} from '../validators/jobApplication.validator';
import { z } from 'zod';

const adminJobApplicationRouter = Router();

adminJobApplicationRouter.use(requireAuth);

adminJobApplicationRouter.get(
  '/list-all-applications',
  validate(adminApplicationListQuerySchema, 'query'),
  listAdminApplications,
);

adminJobApplicationRouter.get(
  '/job-summaries',
  listApplicationJobSummaries,
);

adminJobApplicationRouter.get(
  '/application-detail/:id',
  validate(applicationIdParamSchema, 'params'),
  getAdminApplication,
);

adminJobApplicationRouter.patch(
  '/update-application-status/:id',
  validate(applicationIdParamSchema, 'params'),
  validate(updateApplicationStatusSchema, 'body'),
  updateAdminApplicationStatus,
);

adminJobApplicationRouter.delete(
  '/delete-application/:id',
  validate(applicationIdParamSchema, 'params'),
  deleteAdminApplication,
);

adminJobApplicationRouter.patch(
  '/update-application-notes/:id',
  validate(applicationIdParamSchema, 'params'),
  validate(z.object({ adminNotes: z.string().nullable().optional() }), 'body'),
  updateAdminNotes,
);

adminJobApplicationRouter.get(
  '/application-resume-url/:id',
  validate(applicationIdParamSchema, 'params'),
  validate(applicationResumeQuerySchema, 'query'),
  getApplicationResumeUrl,
);

export default adminJobApplicationRouter;
