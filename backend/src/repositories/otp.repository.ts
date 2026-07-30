import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';

/** Row in otp_verifications (hashed code, UTC expiry, single-use via consumed_at). */
export type OtpRecord = {
  id: number;
  adminId: number;
  otpHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
};

type OtpRow = RowDataPacket & {
  id: number;
  admin_id: number;
  otp_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
};

function mapOtp(row: OtpRow): OtpRecord {
  return {
    id: row.id,
    adminId: row.admin_id,
    otpHash: row.otp_hash,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
  };
}

export class OtpRepository {
  /** Marks unconsumed, unexpired rows as consumed so only one active OTP exists per admin. */
  async invalidateActiveForAdmin(adminId: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query(
        `UPDATE otp_verifications SET consumed_at = UTC_TIMESTAMP()
         WHERE admin_id = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
        [adminId],
      );
    } finally {
      connection.release();
    }
  }

  async create(adminId: number, otpHash: string, expiresAt: Date): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO otp_verifications (admin_id, otp_hash, expires_at) VALUES (?, ?, ?)`,
        [adminId, otpHash, expiresAt],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  /** Latest row still valid for verify-otp (not consumed, expires_at > UTC now). */
  async findLatestValidForAdmin(adminId: number): Promise<OtpRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<OtpRow[]>(
        `SELECT id, admin_id, otp_hash, expires_at, consumed_at
         FROM otp_verifications
         WHERE admin_id = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP()
         ORDER BY id DESC LIMIT 1`,
        [adminId],
      );
      return rows[0] ? mapOtp(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  /** Most recent send time (any row), used for resend cooldown — includes expired/consumed. */
  async findLatestIssuedAtForAdmin(adminId: number): Promise<Date | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT created_at FROM otp_verifications
         WHERE admin_id = ?
         ORDER BY id DESC LIMIT 1`,
        [adminId],
      );
      const row = rows[0] as { created_at: Date } | undefined;
      return row?.created_at ?? null;
    } finally {
      connection.release();
    }
  }

  async markConsumed(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE otp_verifications SET consumed_at = UTC_TIMESTAMP() WHERE id = ?', [
        id,
      ]);
    } finally {
      connection.release();
    }
  }
}
