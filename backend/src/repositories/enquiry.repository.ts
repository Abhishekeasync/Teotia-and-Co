import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { EnquiryRecord } from '../interfaces/enquiry.interface';
import { PaginationParams } from '../utils/pagination';

type EnquiryRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  subject: string;
  message: string;
  created_at: Date;
  deleted_at: Date | null;
};

function mapEnquiry(row: EnquiryRow): EnquiryRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    serviceType: row.service_type,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Repository for contact enquiries — service requests from potential clients.
 */
export class EnquiryRepository {
  /** Create a new enquiry. */
  async create(data: {
    name: string;
    email: string;
    phone: string;
    serviceType: string;
    subject: string;
    message: string;
  }): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO enquiries (name, email, phone, service_type, subject, message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.name, data.email, data.phone, data.serviceType, data.subject, data.message],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  /** Find enquiry by ID (excludes soft-deleted). */
  async findById(id: number): Promise<EnquiryRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<EnquiryRow[]>(
        `SELECT id, name, email, phone, service_type, subject, message, created_at, deleted_at
         FROM enquiries WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      return rows[0] ? mapEnquiry(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  /** List all enquiries (admin view, excludes soft-deleted). */
  async listAll(pagination: PaginationParams): Promise<EnquiryRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<EnquiryRow[]>(
        `SELECT id, name, email, phone, service_type, subject, message, created_at, deleted_at
         FROM enquiries
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [pagination.limit, pagination.offset],
      );
      return rows.map(mapEnquiry);
    } finally {
      connection.release();
    }
  }

  /** Count all enquiries (excludes soft-deleted). */
  async countAll(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM enquiries WHERE deleted_at IS NULL',
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  /** Soft-delete an enquiry. */
  async softDelete(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE enquiries SET deleted_at = NOW() WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }
}
