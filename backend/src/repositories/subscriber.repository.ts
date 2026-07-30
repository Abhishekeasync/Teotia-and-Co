import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { SubscriberRecord } from '../interfaces/subscriber.interface';
import { PaginationParams } from '../utils/pagination';

type SubscriberRow = RowDataPacket & {
  id: number;
  email: string;
  name: string | null;
  unsubscribed_at: Date | null;
  unsubscribe_token: string;
  created_at: Date;
};

function mapSubscriber(row: SubscriberRow): SubscriberRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    unsubscribedAt: row.unsubscribed_at,
    unsubscribeToken: row.unsubscribe_token,
    createdAt: row.created_at,
  };
}

/**
 * Repository for newsletter subscribers — unique email, unsubscribe via token.
 */
export class SubscriberRepository {
  /** Create a new subscriber with a unique unsubscribe token. */
  async create(data: { email: string; name?: string; token: string }): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO subscribers (email, name, unsubscribe_token)
         VALUES (?, ?, ?)`,
        [data.email, data.name ?? null, data.token],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  /** Find subscriber by email (case-insensitive). */
  async findByEmail(email: string): Promise<SubscriberRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<SubscriberRow[]>(
        `SELECT id, email, name, unsubscribed_at, unsubscribe_token, created_at
         FROM subscribers WHERE LOWER(email) = LOWER(?) LIMIT 1`,
        [email],
      );
      return rows[0] ? mapSubscriber(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  /** Find subscriber by unsubscribe token. */
  async findByToken(token: string): Promise<SubscriberRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<SubscriberRow[]>(
        `SELECT id, email, name, unsubscribed_at, unsubscribe_token, created_at
         FROM subscribers WHERE unsubscribe_token = ? LIMIT 1`,
        [token],
      );
      return rows[0] ? mapSubscriber(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  /** Find subscriber by ID. */
  async findById(id: number): Promise<SubscriberRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<SubscriberRow[]>(
        `SELECT id, email, name, unsubscribed_at, unsubscribe_token, created_at
         FROM subscribers WHERE id = ? LIMIT 1`,
        [id],
      );
      return rows[0] ? mapSubscriber(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  /** List all subscribers (admin view). */
  async listAll(pagination: PaginationParams): Promise<SubscriberRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<SubscriberRow[]>(
        `SELECT id, email, name, unsubscribed_at, unsubscribe_token, created_at
         FROM subscribers
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [pagination.limit, pagination.offset],
      );
      return rows.map(mapSubscriber);
    } finally {
      connection.release();
    }
  }

  /** Count all subscribers. */
  async countAll(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM subscribers',
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  /** Mark subscriber as unsubscribed. */
  async markUnsubscribed(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE subscribers SET unsubscribed_at = NOW() WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }

  /** Re-subscribe a previously unsubscribed email. */
  async resubscribe(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE subscribers SET unsubscribed_at = NULL WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }

  /** List only active (non-unsubscribed) subscribers — used for bulk email sends. No pagination: returns all rows. */
  async listActive(): Promise<SubscriberRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<SubscriberRow[]>(
        `SELECT id, email, name, unsubscribed_at, unsubscribe_token, created_at
         FROM subscribers
         WHERE unsubscribed_at IS NULL
         ORDER BY created_at ASC`,
      );
      return rows.map(mapSubscriber);
    } finally {
      connection.release();
    }
  }

  /** Hard delete a subscriber (admin action). */
  async delete(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('DELETE FROM subscribers WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }
}
