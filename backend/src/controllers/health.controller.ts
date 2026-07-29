import { Request, Response } from 'express';
import { testDatabaseConnection } from '../config/database';
import { env } from '../config/env';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  let database: 'up' | 'down' | 'skipped' = 'skipped';

  if (!env.SKIP_DB_CHECK) {
    try {
      await testDatabaseConnection();
      database = 'up';
    } catch {
      database = 'down';
    }
  }

  const status = database === 'down' ? 'degraded' : 'ok';
  const httpStatus = database === 'down' ? 503 : 200;

  return ApiResponse.success(
    res,
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database,
    },
    'Health check',
    httpStatus,
  );
});
