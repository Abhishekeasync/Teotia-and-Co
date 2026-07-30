export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
/** Caps deep pagination to avoid huge offsets and scan-heavy queries. */
export const MAX_PAGE = 1000;

export const BCRYPT_ROUNDS = 12;
/** After a successful OTP, password-only login is allowed until this many days elapse. */
export const OTP_VERIFICATION_WINDOW_DAYS = 7;

export const AUTH_COOKIE_NAME = 'access_token';
/** Per-IP cap on login, verify-otp, and resend-otp combined. */
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const AUTH_RATE_LIMIT_MAX = 20;

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
/** Max gallery images stored per blog post (featured/og are separate SEO fields). */
export const MAX_BLOG_IMAGES = 5;
export const UPLOAD_ALLOWED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/** MySQL pool: max open connections to the server. */
export const DB_POOL_CONNECTION_LIMIT = 10;
/** Max waiters when all connections are busy; excess acquires fail fast instead of queuing forever. */
export const DB_POOL_QUEUE_LIMIT = 20;
/** Max time to wait for a free pool connection (startup ping + /health). */
export const DB_ACQUIRE_TIMEOUT_MS = 5_000;
