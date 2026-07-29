import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import { env } from './env';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

function getPoolOptions(): PoolOptions {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: 'Z',
    dateStrings: false,
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(getPoolOptions());
  }
  return pool;
}

export async function testDatabaseConnection(): Promise<void> {
  const connection = await getPool().getConnection();
  try {
    await connection.ping();
    logger.info('MySQL connection established', {
      host: env.DB_HOST,
      database: env.DB_NAME,
    });
  } finally {
    connection.release();
  }
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('MySQL connection pool closed');
  }
}
