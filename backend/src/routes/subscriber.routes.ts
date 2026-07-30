import { Router } from 'express';
import { subscribe, unsubscribe } from '../controllers/subscriber.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  subscribeBodySchema,
  unsubscribeBodySchema,
} from '../validators/subscriber.validator';

/** Public subscriber APIs — newsletter subscription and unsubscribe. */
const subscriberRouter = Router();

/** Subscribe to newsletter. */
subscriberRouter.post('/subscribe-to-newsletter', validate(subscribeBodySchema), subscribe);

/** Unsubscribe via token. */
subscriberRouter.post('/unsubscribe', validate(unsubscribeBodySchema), unsubscribe);

export default subscriberRouter;
