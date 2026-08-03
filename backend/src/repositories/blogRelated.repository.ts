import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { BlogStatus } from '../interfaces/blog.interface';

export type RelatedPostRow = {
  id: number;
  slug: string;
  heading: string;
  shortDescription: string;
  featuredImageUrl: string | null;
  publishedAt: Date | null;
  status: BlogStatus;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
};

type RelatedPostDbRow = RowDataPacket & {
  id: number;
  slug: string;
  heading: string;
  short_description: string;
  featured_image_url: string | null;
  published_at: Date | null;
  status: BlogStatus;
  category_id: number;
  category_name: string;
  category_slug: string;
  sort_order: number;
};

function mapRelatedPostRow(row: RelatedPostDbRow): RelatedPostRow {
  return {
    id: row.id,
    slug: row.slug,
    heading: row.heading,
    shortDescription: row.short_description,
    featuredImageUrl: row.featured_image_url,
    publishedAt: row.published_at,
    status: row.status,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
  };
}

const RELATED_POST_SELECT = `
  b.id, b.slug, b.heading, b.short_description, b.featured_image_url,
  b.published_at, b.status, c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
  brp.sort_order
`;

const RELATED_POST_JOIN = `
  FROM blog_related_posts brp
  INNER JOIN blogs b ON b.id = brp.related_blog_id
  INNER JOIN categories c ON c.id = b.category_id
`;

export class BlogRelatedRepository {
  async replaceForBlog(blogId: number, relatedBlogIds: number[]): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM blog_related_posts WHERE blog_id = ?', [blogId]);

      for (let i = 0; i < relatedBlogIds.length; i += 1) {
        await connection.query(
          `INSERT INTO blog_related_posts (blog_id, related_blog_id, sort_order) VALUES (?, ?, ?)`,
          [blogId, relatedBlogIds[i], i],
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

  async listRelatedIds(blogId: number): Promise<number[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT related_blog_id FROM blog_related_posts
         WHERE blog_id = ?
         ORDER BY sort_order ASC, id ASC`,
        [blogId],
      );
      return rows.map((row) => row.related_blog_id as number);
    } finally {
      connection.release();
    }
  }

  /** Admin: include draft/unpublished related posts. */
  async listByBlogId(blogId: number): Promise<RelatedPostRow[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RelatedPostDbRow[]>(
        `SELECT ${RELATED_POST_SELECT}
         ${RELATED_POST_JOIN}
         WHERE brp.blog_id = ? AND b.deleted_at IS NULL
         ORDER BY brp.sort_order ASC, brp.id ASC`,
        [blogId],
      );
      return rows.map(mapRelatedPostRow);
    } finally {
      connection.release();
    }
  }

  /** Public: only published, non-deleted related posts. */
  async listPublishedByBlogId(blogId: number): Promise<RelatedPostRow[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RelatedPostDbRow[]>(
        `SELECT ${RELATED_POST_SELECT}
         ${RELATED_POST_JOIN}
         WHERE brp.blog_id = ?
           AND b.deleted_at IS NULL
           AND b.status = 'published'
         ORDER BY brp.sort_order ASC, brp.id ASC`,
        [blogId],
      );
      return rows.map(mapRelatedPostRow);
    } finally {
      connection.release();
    }
  }

  /** Batch fetch for list endpoints — avoids N+1. */
  async listPublishedByBlogIds(blogIds: number[]): Promise<Map<number, RelatedPostRow[]>> {
    const result = new Map<number, RelatedPostRow[]>();
    if (blogIds.length === 0) return result;

    const connection = await acquireConnection();
    try {
      const placeholders = blogIds.map(() => '?').join(', ');
      const [rows] = await connection.query<(RelatedPostDbRow & { blog_id: number })[]>(
        `SELECT brp.blog_id, ${RELATED_POST_SELECT}
         ${RELATED_POST_JOIN}
         WHERE brp.blog_id IN (${placeholders})
           AND b.deleted_at IS NULL
           AND b.status = 'published'
         ORDER BY brp.blog_id ASC, brp.sort_order ASC, brp.id ASC`,
        blogIds,
      );

      for (const row of rows) {
        const blogId = row.blog_id;
        const items = result.get(blogId) ?? [];
        items.push(mapRelatedPostRow(row));
        result.set(blogId, items);
      }

      return result;
    } finally {
      connection.release();
    }
  }

  /** Batch fetch for admin list — includes drafts. */
  async listByBlogIds(blogIds: number[]): Promise<Map<number, RelatedPostRow[]>> {
    const result = new Map<number, RelatedPostRow[]>();
    if (blogIds.length === 0) return result;

    const connection = await acquireConnection();
    try {
      const placeholders = blogIds.map(() => '?').join(', ');
      const [rows] = await connection.query<(RelatedPostDbRow & { blog_id: number })[]>(
        `SELECT brp.blog_id, ${RELATED_POST_SELECT}
         ${RELATED_POST_JOIN}
         WHERE brp.blog_id IN (${placeholders}) AND b.deleted_at IS NULL
         ORDER BY brp.blog_id ASC, brp.sort_order ASC, brp.id ASC`,
        blogIds,
      );

      for (const row of rows) {
        const blogId = row.blog_id;
        const items = result.get(blogId) ?? [];
        items.push(mapRelatedPostRow(row));
        result.set(blogId, items);
      }

      return result;
    } finally {
      connection.release();
    }
  }

  async countValidRelatedIds(relatedIds: number[], excludeId?: number): Promise<number> {
    if (relatedIds.length === 0) return 0;

    const connection = await acquireConnection();
    try {
      const placeholders = relatedIds.map(() => '?').join(', ');
      const params: unknown[] = [...relatedIds];
      let sql = `SELECT COUNT(*) AS total FROM blogs
         WHERE id IN (${placeholders}) AND deleted_at IS NULL`;
      if (excludeId !== undefined) {
        sql += ' AND id <> ?';
        params.push(excludeId);
      }
      const [rows] = await connection.query<RowDataPacket[]>(sql, params);
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async removeAllForBlog(blogId: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query<ResultSetHeader>(
        'DELETE FROM blog_related_posts WHERE blog_id = ? OR related_blog_id = ?',
        [blogId, blogId],
      );
    } finally {
      connection.release();
    }
  }
}
