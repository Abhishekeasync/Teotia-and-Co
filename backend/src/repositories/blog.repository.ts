import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { acquireConnection } from '../config/database';
import {
  BlogRecord,
  BlogStatus,
  PublicBlogListFilters,
  PublicBlogSort,
} from '../interfaces/blog.interface';
import { PaginationParams } from '../utils/pagination';

type BlogRow = RowDataPacket & {
  id: number;
  heading: string;
  slug: string;
  short_description: string;
  body: string;
  featured_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  status: BlogStatus;
  published_at: Date | null;
  category_id: number;
  author_name: string;
  created_by_admin_id: number | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

const BLOG_SELECT = `
  id, heading, slug, short_description, body, featured_image_url,
  meta_title, meta_description, canonical_url, og_image_url,
  status, published_at, category_id, author_name, created_by_admin_id,
  view_count, created_at, updated_at, deleted_at
`;

function mapBlog(row: BlogRow): BlogRecord {
  return {
    id: row.id,
    heading: row.heading,
    slug: row.slug,
    shortDescription: row.short_description,
    body: row.body,
    featuredImageUrl: row.featured_image_url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url,
    ogImageUrl: row.og_image_url,
    status: row.status,
    publishedAt: row.published_at,
    categoryId: row.category_id,
    authorName: row.author_name,
    createdByAdminId: row.created_by_admin_id,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export type CreateBlogRow = {
  heading: string;
  slug: string;
  shortDescription: string;
  body: string;
  categoryId: number;
  authorName: string;
  createdByAdminId: number;
  featuredImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  status?: BlogStatus;
  publishedAt?: Date | null;
};

export type UpdateBlogRow = Partial<
  Omit<CreateBlogRow, 'createdByAdminId'>
> & {
  slug?: string;
  status?: BlogStatus;
};

function sortClause(sort: PublicBlogSort): string {
  switch (sort) {
    case 'oldest':
      return 'b.published_at ASC, b.id ASC';
    case 'popular':
      return 'b.view_count DESC, b.published_at DESC';
    case 'latest':
    default:
      return 'b.published_at DESC, b.id DESC';
  }
}

export class BlogRepository {
  async slugTaken(slug: string, excludeId?: number): Promise<boolean> {
    const connection = await acquireConnection();
    try {
      const params: unknown[] = [slug];
      let sql =
        'SELECT id FROM blogs WHERE slug = ? AND deleted_at IS NULL LIMIT 1';
      if (excludeId !== undefined) {
        sql = 'SELECT id FROM blogs WHERE slug = ? AND id <> ? AND deleted_at IS NULL LIMIT 1';
        params.push(excludeId);
      }
      const [rows] = await connection.query<RowDataPacket[]>(sql, params);
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  async headingTaken(heading: string, excludeId?: number): Promise<boolean> {
    const connection = await acquireConnection();
    try {
      const params: unknown[] = [heading];
      let sql =
        'SELECT id FROM blogs WHERE heading = ? AND deleted_at IS NULL LIMIT 1';
      if (excludeId !== undefined) {
        sql =
          'SELECT id FROM blogs WHERE heading = ? AND id <> ? AND deleted_at IS NULL LIMIT 1';
        params.push(excludeId);
      }
      const [rows] = await connection.query<RowDataPacket[]>(sql, params);
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  async create(row: CreateBlogRow): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO blogs (
          heading, slug, short_description, body, featured_image_url,
          meta_title, meta_description, canonical_url, og_image_url,
          status, published_at, category_id, author_name, created_by_admin_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.heading,
          row.slug,
          row.shortDescription,
          row.body,
          row.featuredImageUrl ?? null,
          row.metaTitle ?? null,
          row.metaDescription ?? null,
          row.canonicalUrl ?? null,
          row.ogImageUrl ?? null,
          row.status ?? 'draft',
          row.publishedAt ?? null,
          row.categoryId,
          row.authorName,
          row.createdByAdminId,
        ],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async update(id: number, row: UpdateBlogRow): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const assign = (column: string, value: unknown) => {
      fields.push(`${column} = ?`);
      values.push(value);
    };

    if (row.heading !== undefined) assign('heading', row.heading);
    if (row.slug !== undefined) assign('slug', row.slug);
    if (row.shortDescription !== undefined) assign('short_description', row.shortDescription);
    if (row.body !== undefined) assign('body', row.body);
    if (row.featuredImageUrl !== undefined) assign('featured_image_url', row.featuredImageUrl);
    if (row.metaTitle !== undefined) assign('meta_title', row.metaTitle);
    if (row.metaDescription !== undefined) assign('meta_description', row.metaDescription);
    if (row.canonicalUrl !== undefined) assign('canonical_url', row.canonicalUrl);
    if (row.ogImageUrl !== undefined) assign('og_image_url', row.ogImageUrl);
    if (row.status !== undefined) assign('status', row.status);
    if (row.publishedAt !== undefined) assign('published_at', row.publishedAt);
    if (row.categoryId !== undefined) assign('category_id', row.categoryId);
    if (row.authorName !== undefined) assign('author_name', row.authorName);

    if (fields.length === 0) {
      return;
    }

    values.push(id);
    const connection = await acquireConnection();
    try {
      await connection.query(
        `UPDATE blogs SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
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
        'UPDATE blogs SET deleted_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NULL',
        [id],
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async findById(id: number): Promise<BlogRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<BlogRow[]>(
        `SELECT ${BLOG_SELECT} FROM blogs WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      return rows[0] ? mapBlog(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findBySlug(slug: string): Promise<BlogRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<BlogRow[]>(
        `SELECT ${BLOG_SELECT} FROM blogs WHERE slug = ? AND deleted_at IS NULL LIMIT 1`,
        [slug],
      );
      return rows[0] ? mapBlog(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findPublishedBySlug(slug: string): Promise<BlogRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<BlogRow[]>(
        `SELECT ${BLOG_SELECT} FROM blogs
         WHERE slug = ? AND status = 'published' AND deleted_at IS NULL LIMIT 1`,
        [slug],
      );
      return rows[0] ? mapBlog(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async incrementViewCount(id: number, connection?: PoolConnection): Promise<void> {
    const run = async (conn: PoolConnection) => {
      await conn.query(
        'UPDATE blogs SET view_count = view_count + 1 WHERE id = ? AND deleted_at IS NULL',
        [id],
      );
    };

    if (connection) {
      await run(connection);
      return;
    }

    const acquired = await acquireConnection();
    try {
      await run(acquired);
    } finally {
      acquired.release();
    }
  }

  private buildPublicWhere(
    filters: PublicBlogListFilters,
    categoryId?: number,
    tagId?: number,
    authorId?: number,
  ): { where: string; params: unknown[] } {
    const clauses = [`b.status = 'published'`, `b.deleted_at IS NULL`];
    const params: unknown[] = [];

    if (filters.search?.trim()) {
      clauses.push('MATCH(b.heading) AGAINST (? IN NATURAL LANGUAGE MODE)');
      params.push(filters.search.trim());
    }
    if (categoryId !== undefined) {
      clauses.push('b.category_id = ?');
      params.push(categoryId);
    }
    if (tagId !== undefined) {
      clauses.push(
        `EXISTS (SELECT 1 FROM blog_tags bt WHERE bt.blog_id = b.id AND bt.tag_id = ?)`,
      );
      params.push(tagId);
    }
    if (authorId !== undefined) {
      clauses.push(
        `EXISTS (SELECT 1 FROM blog_authors ba WHERE ba.blog_id = b.id AND ba.author_id = ?)`,
      );
      params.push(authorId);
    }

    return { where: clauses.join(' AND '), params };
  }

  async countPublic(
    filters: PublicBlogListFilters,
    categoryId?: number,
    tagId?: number,
    authorId?: number,
  ): Promise<number> {
    const { where, params } = this.buildPublicWhere(filters, categoryId, tagId, authorId);
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM blogs b WHERE ${where}`,
        params,
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async listPublic(
    filters: PublicBlogListFilters,
    pagination: PaginationParams,
    categoryId?: number,
    tagId?: number,
    authorId?: number,
  ): Promise<BlogRecord[]> {
    const { where, params } = this.buildPublicWhere(filters, categoryId, tagId, authorId);
    const order = sortClause(filters.sort);
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<BlogRow[]>(
        `SELECT ${BLOG_SELECT.replace(/\n/g, ' ')}
         FROM blogs b
         WHERE ${where}
         ORDER BY ${order}
         LIMIT ? OFFSET ?`,
        [...params, pagination.limit, pagination.offset],
      );
      return rows.map(mapBlog);
    } finally {
      connection.release();
    }
  }

  async countAdmin(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM blogs WHERE deleted_at IS NULL',
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  /** Count all blogs (including deleted, for admin dashboard). */
  async countAll(): Promise<number> {
    return this.countAdmin(); // Same as countAdmin - excludes deleted
  }

  /** Count published blogs only. */
  async countPublished(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM blogs 
         WHERE status = 'published' AND deleted_at IS NULL`,
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  /** Count draft blogs only. */
  async countDrafts(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM blogs 
         WHERE status = 'draft' AND deleted_at IS NULL`,
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async listAdmin(pagination: PaginationParams): Promise<BlogRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<BlogRow[]>(
        `SELECT ${BLOG_SELECT.replace(/\n/g, ' ')}
         FROM blogs
         WHERE deleted_at IS NULL
         ORDER BY updated_at DESC, id DESC
         LIMIT ? OFFSET ?`,
        [pagination.limit, pagination.offset],
      );
      return rows.map(mapBlog);
    } finally {
      connection.release();
    }
  }

  async listImageUrls(blogId: number): Promise<string[]> {
    const items = await this.listImages(blogId);
    return items.map((item) => item.url);
  }

  async listImages(blogId: number): Promise<{ id: number; url: string; sortOrder: number }[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT id, url, sort_order FROM blog_images
         WHERE blog_id = ? ORDER BY sort_order ASC, id ASC`,
        [blogId],
      );
      return rows.map((row) => ({
        id: row.id as number,
        url: row.url as string,
        sortOrder: row.sort_order as number,
      }));
    } finally {
      connection.release();
    }
  }

  async countImages(blogId: number): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM blog_images WHERE blog_id = ?',
        [blogId],
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async findImage(blogId: number, imageId: number): Promise<{ id: number; url: string; sortOrder: number } | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT id, url, sort_order FROM blog_images
         WHERE id = ? AND blog_id = ? LIMIT 1`,
        [imageId, blogId],
      );
      const row = rows[0];
      if (!row) {
        return null;
      }
      return {
        id: row.id as number,
        url: row.url as string,
        sortOrder: row.sort_order as number,
      };
    } finally {
      connection.release();
    }
  }

  async updateImageUrl(imageId: number, url: string): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE blog_images SET url = ? WHERE id = ?', [url, imageId]);
    } finally {
      connection.release();
    }
  }

  async deleteImage(imageId: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('DELETE FROM blog_images WHERE id = ?', [imageId]);
    } finally {
      connection.release();
    }
  }

  async deleteAllImages(blogId: number): Promise<string[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT url FROM blog_images WHERE blog_id = ?',
        [blogId],
      );
      const urls = rows.map((row) => row.url as string);
      await connection.query('DELETE FROM blog_images WHERE blog_id = ?', [blogId]);
      return urls;
    } finally {
      connection.release();
    }
  }

  async appendImage(blogId: number, url: string, sortOrder: number): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO blog_images (blog_id, url, sort_order) VALUES (?, ?, ?)',
        [blogId, url, sortOrder],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  /** Replaces gallery rows. Caller must enforce max count. */
  async replaceImageUrls(blogId: number, urls: string[]): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM blog_images WHERE blog_id = ?', [blogId]);
      for (let i = 0; i < urls.length; i += 1) {
        await connection.query(
          'INSERT INTO blog_images (blog_id, url, sort_order) VALUES (?, ?, ?)',
          [blogId, urls[i], i],
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
