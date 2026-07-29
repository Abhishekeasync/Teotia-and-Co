import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../constants';

/** Implemented in Phase 3 — JWT from HTTP-only cookie. */
export const requireAuth = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
};
