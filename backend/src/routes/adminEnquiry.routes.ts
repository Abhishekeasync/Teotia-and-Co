import { Router } from 'express';
import {
  deleteEnquiry,
  getAdminEnquiry,
  listAdminEnquiries,
} from '../controllers/enquiry.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  adminEnquiryListQuerySchema,
  enquiryIdParamSchema,
} from '../validators/enquiry.validator';

/** Admin enquiry management — requires auth cookie. */
const adminEnquiryRouter = Router();

adminEnquiryRouter.use(requireAuth);

/** List all enquiries. */
adminEnquiryRouter.get(
  '/list-all-enquiries',
  validate(adminEnquiryListQuerySchema, 'query'),
  listAdminEnquiries,
);

/** Get single enquiry details. */
adminEnquiryRouter.get(
  '/enquiry-detail/:id',
  validate(enquiryIdParamSchema, 'params'),
  getAdminEnquiry,
);

/** Delete an enquiry. */
adminEnquiryRouter.delete(
  '/delete-enquiry/:id',
  validate(enquiryIdParamSchema, 'params'),
  deleteEnquiry,
);

export default adminEnquiryRouter;
