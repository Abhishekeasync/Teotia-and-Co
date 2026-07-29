import { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME, HTTP_STATUS } from '../constants';
import { AdminRepository } from '../repositories/admin.repository';
import { ApiError } from '../utils/ApiError';
import { verifyAdminToken } from '../utils/jwt';

const adminRepository = new AdminRepository();

/**
 * Requires valid JWT in access_token cookie. Re-loads admin from DB so revoked/deleted
 * accounts cannot keep using an old token.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (typeof token !== 'string' || token.length === 0) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const payload = verifyAdminToken(token);
    const admin = await adminRepository.findById(payload.sub);
    if (!admin || admin.email !== payload.email) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};
