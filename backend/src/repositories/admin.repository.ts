import { RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { AdminPublicProfile, AdminRecord } from '../interfaces/admin.interface';

type AdminRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  last_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

function mapAdmin(row: AdminRow): AdminRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    lastVerifiedAt: row.last_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function toPublicProfile(admin: AdminRecord): AdminPublicProfile {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    lastVerifiedAt: admin.lastVerifiedAt ? admin.lastVerifiedAt.toISOString() : null,
  };
}

export class AdminRepository {
  async findByEmail(email: string): Promise<AdminRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<AdminRow[]>(
        `SELECT id, email, password_hash, name, last_verified_at, created_at, updated_at, deleted_at
         FROM admins WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
        [email.toLowerCase()],
      );
      return rows[0] ? mapAdmin(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findById(id: number): Promise<AdminRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<AdminRow[]>(
        `SELECT id, email, password_hash, name, last_verified_at, created_at, updated_at, deleted_at
         FROM admins WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      return rows[0] ? mapAdmin(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async updateLastVerifiedAt(adminId: number, verifiedAt: Date): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE admins SET last_verified_at = ? WHERE id = ?', [
        verifiedAt,
        adminId,
      ]);
    } finally {
      connection.release();
    }
  }
}
