import mysql, { Pool, PoolConnection, PoolOptions } from 'mysql2/promise';
import { env } from './env';
import {
  DB_ACQUIRE_TIMEOUT_MS,
  DB_POOL_CONNECTION_LIMIT,
  DB_POOL_QUEUE_LIMIT,
} from '../constants';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

function poolConnectionLimit(): number {
  return env.DB_POOL_CONNECTION_LIMIT ?? DB_POOL_CONNECTION_LIMIT;
}

function poolQueueLimit(): number {
  return env.DB_POOL_QUEUE_LIMIT ?? DB_POOL_QUEUE_LIMIT;
}

function acquireTimeoutMs(): number {
  return env.DB_ACQUIRE_TIMEOUT_MS ?? DB_ACQUIRE_TIMEOUT_MS;
}

function getPoolOptions(): PoolOptions {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: poolConnectionLimit(),
    queueLimit: poolQueueLimit(),
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

/**
 * Gets a connection from the pool with a hard timeout.
 * If the timeout fires first, a late-arriving connection is released (no leak).
 */
export async function acquireConnection(
  timeoutMs: number = acquireTimeoutMs(),
): Promise<PoolConnection> {
  const activePool = getPool();

  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      settled = true;
      reject(new Error(`MySQL connection acquire timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    activePool
      .getConnection()
      .then((connection) => {
        clearTimeout(timer);
        if (settled) {
          connection.release();
          return;
        }
        resolve(connection);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        if (!settled) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
  });
}

export async function testDatabaseConnection(): Promise<void> {
  const connection = await acquireConnection();
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
