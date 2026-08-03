import { BlogRepository } from '../repositories/blog.repository';
import { BlogService } from '../services/blog.service';
import { logger } from '../utils/logger';
import { acquireConnection } from '../config/database';
import { RowDataPacket } from 'mysql2/promise';

const blogRepository = new BlogRepository();
const blogService = new BlogService();
const POLLING_INTERVAL_MS = 60000; // 1 minute

let schedulerTimer: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function processScheduledBlogs() {
  if (isProcessing) {
    logger.warn('[SCHEDULER] Previous run still in progress, skipping this tick');
    return;
  }
  isProcessing = true;
  try {
    const connection = await acquireConnection();
    try {
      // We use a basic lock or just rely on a fast query if it's a single instance
      // For single instances, selecting pending scheduled posts is safe enough.
      // If running multiple instances, we'd want `SELECT ... FOR UPDATE SKIP LOCKED` inside a transaction.
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM blogs 
       WHERE publish_type = 'scheduled' 
         AND scheduler_status = 'pending' 
         AND scheduled_publish_at <= NOW()
         AND deleted_at IS NULL`
      );

      const pendingIds = rows.map(r => r.id as number);
      
      if (pendingIds.length > 0) {
        logger.info('[SCHEDULER] Found pending scheduled blogs', { count: pendingIds.length, pendingIds });

        for (const id of pendingIds) {
          try {
            // Double check the state just in case, and update
            await blogService.publish(id);
            
            // Publish already updates status to 'published' and published_at.
            // We also need to update publish_type to 'publish_now' or leave it as scheduled but update scheduler_status.
            // Let's just update scheduler_status to published.
            await blogRepository.update(id, { schedulerStatus: 'published' });
            logger.info(`[SCHEDULER] Successfully published scheduled blog ${id}`);
          } catch (error) {
            logger.error(`[SCHEDULER] Failed to publish scheduled blog ${id}`, { error });
            await blogRepository.update(id, { schedulerStatus: 'failed' });
          }
        }
      }
    } catch (error) {
      logger.error('[SCHEDULER] Error processing scheduled blogs', { error });
    } finally {
      connection.release();
    }
  } finally {
    isProcessing = false;
  }
}

export function startScheduler() {
  if (schedulerTimer) {
    logger.warn('[SCHEDULER] Scheduler already running');
    return;
  }
  
  logger.info('[SCHEDULER] Starting blog publishing scheduler');
  
  // Run immediately once
  processScheduledBlogs().catch(e => logger.error('Initial scheduler run failed', { error: e }));

  // Then run periodically
  schedulerTimer = setInterval(() => {
    processScheduledBlogs().catch(e => logger.error('Scheduler run failed', { error: e }));
  }, POLLING_INTERVAL_MS);
}

export function stopScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    logger.info('[SCHEDULER] Stopped blog publishing scheduler');
  }
}
