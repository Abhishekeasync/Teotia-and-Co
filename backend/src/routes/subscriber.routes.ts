import { Router } from 'express';
import { subscribe, unsubscribe } from '../controllers/subscriber.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  subscribeBodySchema,
  unsubscribeBodySchema,
  unsubscribeQuerySchema,
} from '../validators/subscriber.validator';

/** Public subscriber APIs — newsletter subscription and unsubscribe. */
const subscriberRouter = Router();

/** Subscribe to newsletter. */
subscriberRouter.post('/subscribe-to-newsletter', validate(subscribeBodySchema), subscribe);

/** Unsubscribe via token (GET for email links, POST for API). */
subscriberRouter.get('/unsubscribe', validate(unsubscribeQuerySchema, 'query'), unsubscribe);
subscriberRouter.post('/unsubscribe', validate(unsubscribeBodySchema), unsubscribe);

export default subscriberRouter;
