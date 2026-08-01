/**
 * Ensures the first CMS admin exists (idempotent).
 * Uses SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD from env.
 */
import bcrypt from 'bcrypt';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { env } from '../config/env';
import { getPool } from '../config/database';
import { BCRYPT_ROUNDS } from '../constants';
import { logger } from '../utils/logger';

export type SeedAdminOptions = {
  /** When true, missing SEED_ADMIN_* env vars throw instead of skipping. */
  required?: boolean;
};

/** Creates the first CMS admin if none exists with SEED_ADMIN_EMAIL. */
export async function seedAdmin(options: SeedAdminOptions = {}): Promise<number | null> {
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    if (options.required) {
      throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env to run seed');
    }
    logger.info('Admin seed skipped (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not configured)');
    return null;
  }

  const pool = getPool();
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE email = ? AND deleted_at IS NULL LIMIT 1',
    [email],
  );

  if (existing.length > 0) {
    logger.info('Admin seed skipped (already exists)', { email });
    return existing[0].id as number;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const name = 'Kunal Teotia';
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)',
    [email, passwordHash, name],
  );

  logger.info('Admin seeded', { email });
  return result.insertId;
}
