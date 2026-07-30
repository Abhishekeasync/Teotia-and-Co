import { createHash, randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../constants';

/** Cryptographically random numeric code (leading zeros preserved). */
export function generateOtpCode(length = 6): string {
  const max = 10 ** length;
  const value = randomInt(0, max);
  return value.toString().padStart(length, '0');
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_ROUNDS);
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/** Legacy helper if storing sha256 instead of bcrypt — not used for new OTP rows. */
export function sha256Otp(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}
