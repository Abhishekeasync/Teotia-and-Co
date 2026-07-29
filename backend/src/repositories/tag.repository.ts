import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { normalizeTagName } from '../utils/slug';

export class TagRepository {
  async findOrCreateIds(names: string[]): Promise<number[]> {
    const normalized = [...new Set(names.map(normalizeTagName).filter((n) => n.length > 0))];
    if (normalized.length === 0) {
      return [];
    }

    const connection = await acquireConnection();
    try {
      const ids: number[] = [];
      for (const name of normalized) {
        const [rows] = await connection.query<RowDataPacket[]>(
          'SELECT id FROM tags WHERE name = ? LIMIT 1',
          [name],
        );
        if (rows[0]) {
          ids.push(rows[0].id as number);
          continue;
        }
        const [result] = await connection.query<ResultSetHeader>(
          'INSERT INTO tags (name) VALUES (?)',
          [name],
        );
        ids.push(result.insertId);
      }
      return ids;
    } finally {
      connection.release();
    }
  }

  async findIdByName(name: string): Promise<number | null> {
    const normalized = normalizeTagName(name);
    if (!normalized) {
      return null;
    }
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM tags WHERE name = ? LIMIT 1',
        [normalized],
      );
      return rows[0] ? (rows[0].id as number) : null;
    } finally {
      connection.release();
    }
  }

  async replaceBlogTags(blogId: number, tagIds: number[]): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM blog_tags WHERE blog_id = ?', [blogId]);
      for (const tagId of tagIds) {
        await connection.query('INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)', [
          blogId,
          tagId,
        ]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listNamesByBlogId(blogId: number): Promise<string[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT t.name FROM tags t
         INNER JOIN blog_tags bt ON bt.tag_id = t.id
         WHERE bt.blog_id = ?
         ORDER BY t.name ASC`,
        [blogId],
      );
      return rows.map((row) => row.name as string);
    } finally {
      connection.release();
    }
  }
}
