import { Router } from 'express';
import { createEnquiry, getServiceTypes } from '../controllers/enquiry.controller';
import { validate } from '../middlewares/validation.middleware';
import { createEnquiryBodySchema } from '../validators/enquiry.validator';

/** Public enquiry API — contact form submission. */
const enquiryRouter = Router();

/** Get available service types for dropdown. */
enquiryRouter.get('/service-types', getServiceTypes);

/** Submit an enquiry. */
enquiryRouter.post('/', validate(createEnquiryBodySchema), createEnquiry);

export default enquiryRouter;
