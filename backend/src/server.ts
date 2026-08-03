import { createApp } from './app';
import { closeDatabasePool, testDatabaseConnection } from './config/database';
import { env } from './config/env';
import { runMigrations } from './database/migrate';
import { startScheduler, stopScheduler } from './jobs/scheduler.job';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  if (!env.SKIP_MIGRATIONS) {
    await runMigrations();
  } else {
    logger.warn('SKIP_MIGRATIONS enabled — skipping database migrations on startup');
  }

  if (!env.SKIP_DB_CHECK) {
    await testDatabaseConnection();
  } else {
    logger.warn('SKIP_DB_CHECK enabled — skipping MySQL ping on startup');
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info('Server listening', { port: env.PORT, nodeEnv: env.NODE_ENV });
    startScheduler();
  });

  const shutdown = async (signal: string) => {
    logger.info('Shutdown signal received', { signal });
    stopScheduler();
    server.close(async () => {
      await closeDatabasePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Startup failed';
  logger.error('Failed to start server', { message });
  process.exit(1);
});
