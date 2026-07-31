import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { CommentRecord, CommentStatus } from '../interfaces/comment.interface';
import { PaginationParams } from '../utils/pagination';

type CommentRow = RowDataPacket & {
  id: number;
  blog_id: number;
  name: string;
  email: string;
  comment: string;
  status: CommentStatus;
  approved_at: Date | null;
  created_at: Date;
  deleted_at: Date | null;
};

function mapComment(row: CommentRow): CommentRecord {
  return {
    id: row.id,
    blogId: row.blog_id,
    name: row.name,
    email: row.email,
    comment: row.comment,
    status: row.status,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Repository for blog comments — moderation workflow (pending → approved|rejected).
 */
export class CommentRepository {
  /** Create a new comment (defaults to pending status). */
  async create(data: {
    blogId: number;
    name: string;
    email: string;
    comment: string;
  }): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO comments (blog_id, name, email, comment, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [data.blogId, data.name, data.email, data.comment],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  /** Find comment by ID (includes soft-deleted). */
  async findById(id: number): Promise<CommentRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<CommentRow[]>(
        `SELECT id, blog_id, name, email, comment, status, approved_at, created_at, deleted_at
         FROM comments WHERE id = ? LIMIT 1`,
        [id],
      );
      return rows[0] ? mapComment(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  /** List approved comments for a blog post (public view, excludes deleted). */
  async listApprovedByBlog(
    blogId: number,
    pagination: PaginationParams,
  ): Promise<CommentRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<CommentRow[]>(
        `SELECT id, blog_id, name, email, comment, status, approved_at, created_at, deleted_at
         FROM comments
         WHERE blog_id = ? AND status = 'approved' AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [blogId, pagination.limit, pagination.offset],
      );
      return rows.map(mapComment);
    } finally {
      connection.release();
    }
  }

  /** Count approved comments for a blog post. */
  async countApprovedByBlog(blogId: number): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM comments
         WHERE blog_id = ? AND status = 'approved' AND deleted_at IS NULL`,
        [blogId],
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  /** Admin list — filter by status, excludes soft-deleted. */
  async listAdmin(
    filters: { status?: CommentStatus },
    pagination: PaginationParams,
  ): Promise<
    Array<
      CommentRecord & {
        blogSlug: string;
        blogHeading: string;
      }
    >
  > {
    const connection = await acquireConnection();
    try {
      let query = `
        SELECT c.id, c.blog_id, c.name, c.email, c.comment, c.status, c.approved_at, c.created_at, c.deleted_at,
               b.slug AS blog_slug, b.heading AS blog_heading
        FROM comments c
        INNER JOIN blogs b ON b.id = c.blog_id
        WHERE c.deleted_at IS NULL
      `;
      const params: unknown[] = [];

      if (filters.status) {
        query += ' AND c.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);

      const [rows] = await connection.query<
        (CommentRow & { blog_slug: string; blog_heading: string })[]
      >(query, params);

      return rows.map((row) => ({
        ...mapComment(row),
        blogSlug: row.blog_slug,
        blogHeading: row.blog_heading,
      }));
    } finally {
      connection.release();
    }
  }

  /** Count comments for admin list (with optional status filter). */
  async countAdmin(filters: { status?: CommentStatus }): Promise<number> {
    const connection = await acquireConnection();
    try {
      let query = 'SELECT COUNT(*) AS total FROM comments WHERE deleted_at IS NULL';
      const params: unknown[] = [];

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      const [rows] = await connection.query<RowDataPacket[]>(query, params);
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  /** Update comment status and set approved_at if status is 'approved'. */
  async updateStatus(id: number, status: CommentStatus): Promise<void> {
    const connection = await acquireConnection();
    try {
      const approvedAt = status === 'approved' ? 'NOW()' : 'NULL';
      await connection.query(
        `UPDATE comments SET status = ?, approved_at = ${approvedAt} WHERE id = ?`,
        [status, id],
      );
    } finally {
      connection.release();
    }
  }

  /** Soft-delete a comment. */
  async softDelete(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE comments SET deleted_at = NOW() WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }
}
