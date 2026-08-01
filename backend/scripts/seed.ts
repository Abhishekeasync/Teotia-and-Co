/**
 * Initial data for local/dev: admin user + categories + published blogs.
 *
 * Sources mock content from ../lib/blog-posts.ts (same as Next.js frontend).
 * Safe to re-run: skips admin if email exists; skips blogs if any row exists.
 *
 * Dev only — requires in .env: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (+ DB_*).
 * Production: create admins manually; this script does not insert admin data.
 *
 * CLI: npm run seed   (or npm run db:setup = migrate + seed)
 */
import bcrypt from 'bcrypt';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { blogPosts } from '../../lib/blog-posts';
import { env, isProduction } from '../src/config/env';
import { closeDatabasePool, getPool } from '../src/config/database';
import { runMigrations } from '../src/database/migrate';
import { BCRYPT_ROUNDS } from '../src/constants';
import { logger } from '../src/utils/logger';
import { slugify } from '../src/utils/slug';

/** Mock posts use display dates like "Jan 31" — mapped to 2026 for published_at. */
const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Frontend used string[] paragraphs; CMS stores HTML body. */
function paragraphsToHtml(paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
}

function parseDisplayDate(display: string): Date {
  const [mon, dayRaw] = display.trim().split(/\s+/);
  const month = MONTH_MAP[mon] ?? '01';
  const day = dayRaw.padStart(2, '0');
  return new Date(`2026-${month}-${day}T12:00:00.000Z`);
}

/** Creates the first CMS admin if none exists with SEED_ADMIN_EMAIL (dev only). */
async function seedAdmin(): Promise<number> {
  if (isProduction) {
    throw new Error('Admin seed is disabled in production. Create admins manually.');
  }

  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env to run seed');
  }

  const pool = getPool();
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE email = ? AND deleted_at IS NULL LIMIT 1',
    [email],
  );

  if (existing.length > 0) {
    logger.info('Admin seed skipped (already exists)', { email });
    return existing[0].id as number;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const name = 'Kunal Teotia';
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)',
    [email, passwordHash, name],
  );

  logger.info('Admin seeded', { email });
  return result.insertId;
}

async function getOrCreateCategory(name: string): Promise<number> {
  const pool = getPool();
  const slug = slugify(name);
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1',
    [name, slug],
  );
  if (rows.length > 0) {
    return rows[0].id as number;
  }
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO categories (name, slug) VALUES (?, ?)',
    [name, slug],
  );
  return result.insertId;
}

/** Ensures planned category labels exist before inserting blogs. */
async function seedCategoriesFromPosts(): Promise<void> {
  const defaults = ['Taxation', 'GST', 'Compliance', 'Company Law'];
  const fromPosts = blogPosts.map((p) => p.category);
  const unique = [...new Set([...defaults, ...fromPosts])];
  for (const name of unique) {
    await getOrCreateCategory(name);
  }
}

/** Imports all mock posts as published blogs (images stay as local /assets paths until S3). */
async function seedBlogs(adminId: number): Promise<void> {
  const pool = getPool();
  const [countRows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM blogs WHERE deleted_at IS NULL',
  );
  const total = Number(countRows[0]?.total ?? 0);
  if (total > 0) {
    logger.info('Blog seed skipped (blogs already present)', { total });
    return;
  }

  const siteBase = env.BASE_URL.replace(/\/$/, '');

  for (const post of blogPosts) {
    const categoryId = await getOrCreateCategory(post.category);
    const body = paragraphsToHtml(post.content);
    const publishedAt = parseDisplayDate(post.date);
    const canonicalUrl = `${siteBase}/blog/${post.slug}`;

    await pool.query(
      `INSERT INTO blogs (
        heading, slug, short_description, body, featured_image_url,
        meta_title, meta_description, canonical_url, og_image_url,
        status, published_at, category_id, author_name, created_by_admin_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?)`,
      [
        post.title,
        post.slug,
        post.excerpt,
        body,
        post.image,
        post.title,
        post.excerpt,
        canonicalUrl,
        post.image,
        publishedAt,
        categoryId,
        post.author,
        adminId,
      ],
    );
  }

  logger.info('Blogs seeded from lib/blog-posts.ts', { count: blogPosts.length });
}

async function main(): Promise<void> {
  try {
    await runMigrations();
    if (isProduction) {
      logger.info('Seed skipped in production (no admin or mock blog data)');
      return;
    }
    const adminId = await seedAdmin();
    await seedCategoriesFromPosts();
    await seedBlogs(adminId);
    logger.info('Seed complete');
  } finally {
    await closeDatabasePool();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Seed failed';
    logger.error(message);
    process.exit(1);
  });
}

export { main as runSeed };
