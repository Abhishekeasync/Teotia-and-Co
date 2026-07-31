import { Request, Response } from 'express';
import { SubscriberService, SubscribeInput } from '../services/subscriber.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePaginationQuery } from '../utils/pagination';

const subscriberService = new SubscriberService();

/** Public: Subscribe to newsletter. */
export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as SubscribeInput;

  const result = await subscriberService.subscribe(body);

  return ApiResponse.success(res, {}, result.message, 201);
});

/** Public: Unsubscribe via token. */
export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body as { token: string };

  const result = await subscriberService.unsubscribe(token);

  return ApiResponse.success(res, {}, result.message);
});

/** Admin: List all subscribers. */
export const listAdminSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePaginationQuery(req.query);

  const result = await subscriberService.listAllSubscribers(pagination);

  return ApiResponse.success(res, result, '');
});

/** Admin: Delete a subscriber. */
export const deleteSubscriber = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await subscriberService.deleteSubscriber(Number(id));

  return ApiResponse.success(res, {}, 'Subscriber deleted');
});
