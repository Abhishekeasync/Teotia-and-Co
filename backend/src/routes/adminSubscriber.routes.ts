import { Router } from 'express';
import {
  deleteSubscriber,
  listAdminSubscribers,
} from '../controllers/subscriber.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  adminSubscriberListQuerySchema,
  subscriberIdParamSchema,
} from '../validators/subscriber.validator';

/** Admin subscriber management — requires auth cookie. */
const adminSubscriberRouter = Router();

adminSubscriberRouter.use(requireAuth);

/** List all subscribers. */
adminSubscriberRouter.get(
  '/',
  validate(adminSubscriberListQuerySchema, 'query'),
  listAdminSubscribers,
);

/** Delete a subscriber. */
adminSubscriberRouter.delete(
  '/:id',
  validate(subscriberIdParamSchema, 'params'),
  deleteSubscriber,
);

export default adminSubscriberRouter;
