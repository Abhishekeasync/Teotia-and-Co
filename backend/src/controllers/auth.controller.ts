import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/** HTTP handlers for /api/v1/auth — thin layer; cookies and OTP rules live in AuthService. */
const authService = new AuthService();

/** First hop from X-Forwarded-For when behind a reverse proxy. */
function clientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }
  return req.ip ?? null;
}

function userAgent(req: Request): string | null {
  const ua = req.headers['user-agent'];
  return typeof ua === 'string' ? ua.slice(0, 512) : null;
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password, clientIp(req), userAgent(req), res);

  if (result.otpRequired) {
    return ApiResponse.success(res, { otpRequired: true }, result.message);
  }

  return ApiResponse.success(res, { otpRequired: false, admin: result.admin }, 'Login successful');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email: string; otp: string };
  const admin = await authService.verifyOtpAndLogin(
    email,
    otp,
    clientIp(req),
    userAgent(req),
    res,
  );
  return ApiResponse.success(res, { admin }, 'OTP verified');
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const { retryAfterSeconds } = await authService.resendOtp(
    email,
    password,
    clientIp(req),
    userAgent(req),
  );
  return ApiResponse.success(
    res,
    { otpRequired: true, retryAfterSeconds },
    'A new OTP has been sent to your email.',
  );
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  authService.clearAuthCookie(res);
  return ApiResponse.success(res, {}, 'Logged out');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const admin = await authService.getProfile(req.admin!.id);
  return ApiResponse.success(res, { admin }, '');
});
