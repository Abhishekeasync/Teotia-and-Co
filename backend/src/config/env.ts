import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const emptyToUndefined = (value: unknown) =>
  value === '' || value === undefined ? undefined : value;

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().optional().default(''),
  DB_POOL_CONNECTION_LIMIT: z.coerce.number().int().positive().optional(),
  DB_POOL_QUEUE_LIMIT: z.coerce.number().int().nonnegative().optional(),
  DB_ACQUIRE_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRE: z.string().min(1),
  COOKIE_SECRET: z.string().min(16),
  BASE_URL: z.url(),
  AWS_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AWS_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AWS_REGION: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AWS_BUCKET_NAME: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  SMTP_PASSWORD: z.preprocess(emptyToUndefined, z.string().optional()),
  SKIP_DB_CHECK: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  SEED_ADMIN_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  SEED_ADMIN_PASSWORD: z.preprocess(emptyToUndefined, z.string().optional()),
  /** One-time login code lifetime in minutes (default 10). */
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  /** Minimum seconds between OTP emails for the same admin (default 60). */
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().nonnegative().default(60),
  /** Frontend URL for email links (unsubscribe, etc.). */
  FRONTEND_URL: z.preprocess(emptyToUndefined, z.url().optional().default('http://localhost:3000')),
  /** Admin email for enquiry notifications (fallback to SEED_ADMIN_EMAIL). */
  ADMIN_NOTIFICATION_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error('Invalid environment configuration:\n', formatted);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';

export function requireAwsEnv(): {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
} {
  const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET_NAME } = env;
  if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AWS_REGION || !AWS_BUCKET_NAME) {
    throw new Error('AWS environment variables are not fully configured');
  }
  return {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    region: AWS_REGION,
    bucket: AWS_BUCKET_NAME,
  };
}

export function requireSmtpEnv(): {
  host: string;
  port: number;
  user: string;
  pass: string;
} {
  const { SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD } = env;
  if (!SMTP_HOST || !SMTP_EMAIL || !SMTP_PASSWORD) {
    throw new Error('SMTP environment variables are not fully configured');
  }
  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  };
}
