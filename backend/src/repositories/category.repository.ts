import { RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { BlogCategoryRef } from '../interfaces/blog.interface';

type CategoryRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
};

function mapCategory(row: CategoryRow): BlogCategoryRef {
  return { id: row.id, name: row.name, slug: row.slug };
}

export class CategoryRepository {
  async findById(id: number): Promise<BlogCategoryRef | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<CategoryRow[]>(
        'SELECT id, name, slug FROM categories WHERE id = ? LIMIT 1',
        [id],
      );
      return rows[0] ? mapCategory(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findBySlug(slug: string): Promise<BlogCategoryRef | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<CategoryRow[]>(
        'SELECT id, name, slug FROM categories WHERE slug = ? LIMIT 1',
        [slug],
      );
      return rows[0] ? mapCategory(rows[0]) : null;
    } finally {
      connection.release();
    }
  }
}
