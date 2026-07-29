import { z } from 'zod';

/** POST /login and POST /resend-otp (resend must re-prove password to avoid OTP email spam). */
export const loginBodySchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const verifyOtpBodySchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

/** Same fields as login — client should keep password until OTP step completes. */
export const resendOtpBodySchema = loginBodySchema;
