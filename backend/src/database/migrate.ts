/**
 * Runs SQL files in backend/migrations/ in alphabetical order.
 *
 * Flow:
 * 1. Ensure schema_migrations table exists (ledger of applied files).
 * 2. Read filenames already in schema_migrations.
 * 3. For each *.sql not yet applied → run statements in a transaction → insert ledger row.
 *
 * CLI: npm run migrate
 */
import fs from 'fs';
import path from 'path';
import { RowDataPacket } from 'mysql2';
import { getPool, closeDatabasePool } from '../config/database';
import { isProduction } from '../config/env';
import { logger } from '../utils/logger';
import { seedAdmin } from './seedAdmin';

// dist/database → backend/migrations when built; same when run via ts-node from src/
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

/** Ledger table must exist before we can query which migrations ran. */
async function ensureMigrationsTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_schema_migrations_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT filename FROM schema_migrations ORDER BY filename',
  );
  return new Set(rows.map((row) => row.filename));
}

function listMigrationFiles(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

function stripLineComments(sql: string): string {
  // Migration files use `--` headers; semicolons inside those lines must not split statements.
  return sql
    .split('\n')
    .map((line) => (line.trimStart().startsWith('--') ? '' : line))
    .join('\n');
}

/** Split migration SQL on `;` after removing `--` line comments (files use comment headers). */
function parseMigrationStatements(sql: string): string[] {
  return stripLineComments(sql)
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Runs one migration file atomically: all statements succeed or none are kept.
 * Records filename in schema_migrations so it is never applied again.
 */
async function applyMigration(filename: string, sql: string): Promise<void> {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const statements = parseMigrationStatements(sql);

    for (const statement of statements) {
      await connection.query(statement);
    }
    await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [filename]);
    await connection.commit();
    logger.info('Migration applied', { filename });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function runMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = listMigrationFiles();

  if (files.length === 0) {
    const message = `No migration files found in ${MIGRATIONS_DIR}`;
    if (isProduction) {
      throw new Error(`${message}. Deploy backend/migrations/ alongside dist/.`);
    }
    logger.warn(message);
    return;
  }

  for (const filename of files) {
    if (applied.has(filename)) {
      logger.debug('Migration skipped (already applied)', { filename });
      continue;
    }
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await applyMigration(filename, sql);
  }
}

async function main(): Promise<void> {
  try {
    await runMigrations();
    await seedAdmin();
    logger.info('Migrations complete');
  } finally {
    await closeDatabasePool();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Migration failed';
    logger.error(message);
    process.exit(1);
  });
}
