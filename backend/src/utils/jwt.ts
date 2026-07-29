import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtAdminPayload } from '../interfaces/admin.interface';

export function signAdminToken(payload: JwtAdminPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAdminToken(token: string): JwtAdminPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  const sub = Number((decoded as jwt.JwtPayload).sub);
  const email = (decoded as jwt.JwtPayload).email;
  if (!Number.isFinite(sub) || typeof email !== 'string') {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  return { sub, email };
}

/** Converts JWT expire strings like 7d, 12h to cookie maxAge in ms. */
export function jwtExpireToMs(expire: string): number {
  const match = /^(\d+)\s*([smhd])$/i.exec(expire.trim());
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (multipliers[unit] ?? multipliers.d);
}
