import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { AuthorRecord, AuthorSummary } from '../interfaces/author.interface';
import { PaginationParams } from '../utils/pagination';

type AuthorRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  designation: string | null;
  profile_image_url: string | null;
  bio: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

const AUTHOR_SELECT = `
  id, name, slug, designation, profile_image_url, bio,
  facebook_url, twitter_url, linkedin_url, created_at, updated_at, deleted_at
`;

function mapAuthor(row: AuthorRow): AuthorRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    designation: row.designation,
    profileImageUrl: row.profile_image_url,
    bio: row.bio,
    facebookUrl: row.facebook_url,
    twitterUrl: row.twitter_url,
    linkedinUrl: row.linkedin_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export type CreateAuthorRow = {
  name: string;
  slug: string;
  designation?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
};

export type UpdateAuthorRow = Partial<CreateAuthorRow>;

export class AuthorRepository {
  async slugTaken(slug: string, excludeId?: number): Promise<boolean> {
    const connection = await acquireConnection();
    try {
      const params: unknown[] = [slug];
      let sql = 'SELECT id FROM authors WHERE slug = ? AND deleted_at IS NULL LIMIT 1';
      if (excludeId !== undefined) {
        sql = 'SELECT id FROM authors WHERE slug = ? AND id <> ? AND deleted_at IS NULL LIMIT 1';
        params.push(excludeId);
      }
      const [rows] = await connection.query<RowDataPacket[]>(sql, params);
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  async create(row: CreateAuthorRow): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO authors (
          name, slug, designation, profile_image_url, bio, facebook_url, twitter_url, linkedin_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.name,
          row.slug,
          row.designation ?? null,
          row.profileImageUrl ?? null,
          row.bio ?? null,
          row.facebookUrl ?? null,
          row.twitterUrl ?? null,
          row.linkedinUrl ?? null,
        ],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async update(id: number, row: UpdateAuthorRow): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const assign = (column: string, value: unknown) => {
      fields.push(`${column} = ?`);
      values.push(value);
    };

    if (row.name !== undefined) assign('name', row.name);
    if (row.slug !== undefined) assign('slug', row.slug);
    if (row.designation !== undefined) assign('designation', row.designation);
    if (row.profileImageUrl !== undefined) assign('profile_image_url', row.profileImageUrl);
    if (row.bio !== undefined) assign('bio', row.bio);
    if (row.facebookUrl !== undefined) assign('facebook_url', row.facebookUrl);
    if (row.twitterUrl !== undefined) assign('twitter_url', row.twitterUrl);
    if (row.linkedinUrl !== undefined) assign('linkedin_url', row.linkedinUrl);

    if (fields.length === 0) return;

    values.push(id);
    const connection = await acquireConnection();
    try {
      await connection.query(
        `UPDATE authors SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
        values,
      );
    } finally {
      connection.release();
    }
  }

  async softDelete(id: number): Promise<boolean> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        'UPDATE authors SET deleted_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NULL',
        [id],
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async findById(id: number): Promise<AuthorRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<AuthorRow[]>(
        `SELECT ${AUTHOR_SELECT} FROM authors WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      return rows[0] ? mapAuthor(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findBySlug(slug: string): Promise<AuthorRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<AuthorRow[]>(
        `SELECT ${AUTHOR_SELECT} FROM authors WHERE slug = ? AND deleted_at IS NULL LIMIT 1`,
        [slug],
      );
      return rows[0] ? mapAuthor(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async countAdmin(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM authors WHERE deleted_at IS NULL',
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async listAdmin(pagination: PaginationParams): Promise<AuthorRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<AuthorRow[]>(
        `SELECT ${AUTHOR_SELECT.replace(/\n/g, ' ')}
         FROM authors
         WHERE deleted_at IS NULL
         ORDER BY updated_at DESC, id DESC
         LIMIT ? OFFSET ?`,
        [pagination.limit, pagination.offset],
      );
      return rows.map(mapAuthor);
    } finally {
      connection.release();
    }
  }

  /** Retrieve authors for a given blog */
  async findByBlogId(blogId: number): Promise<AuthorSummary[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT a.id, a.name, a.slug, a.designation, a.profile_image_url
         FROM authors a
         INNER JOIN blog_authors ba ON a.id = ba.author_id
         WHERE ba.blog_id = ? AND a.deleted_at IS NULL
         ORDER BY ba.author_order ASC`,
        [blogId],
      );
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        designation: row.designation,
        profileImageUrl: row.profile_image_url,
      }));
    } finally {
      connection.release();
    }
  }

  /** Replace blog authors */
  async replaceBlogAuthors(blogId: number, authorIds: number[]): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM blog_authors WHERE blog_id = ?', [blogId]);
      
      for (let i = 0; i < authorIds.length; i++) {
        await connection.query(
          'INSERT INTO blog_authors (blog_id, author_id, author_order) VALUES (?, ?, ?)',
          [blogId, authorIds[i], i]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
