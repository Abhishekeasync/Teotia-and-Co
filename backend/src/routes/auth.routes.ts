import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me, resendOtp, verifyOtp } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { loginBodySchema, resendOtpBodySchema, verifyOtpBodySchema } from '../validators/auth.validator';
import { AUTH_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_WINDOW_MS } from '../constants';

/**
 * Auth routes (mounted at /api/v1/auth).
 * All POST login/OTP endpoints share IP rate limiting; JWT is read from httpOnly cookie.
 */
const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  limit: AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts',
    errors: ['Rate limit exceeded'],
  },
});

authRouter.use(authLimiter);

authRouter.post('/login', validate(loginBodySchema), login);
authRouter.post('/verify-otp', validate(verifyOtpBodySchema), verifyOtp);
authRouter.post('/resend-otp', validate(resendOtpBodySchema), resendOtp);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);

export default authRouter;
