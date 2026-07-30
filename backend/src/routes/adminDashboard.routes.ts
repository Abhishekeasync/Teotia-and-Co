import { Router } from 'express';
import { getDashboardStats, getDashboardRecent } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { dashboardRecentQuerySchema } from '../validators/dashboard.validator';

/**
 * Admin Dashboard APIs — statistics and recent activity.
 * All endpoints require authentication.
 */
const adminDashboardRouter = Router();

/** Apply authentication to all dashboard routes. */
adminDashboardRouter.use(requireAuth);

/**
 * GET /admin/dashboard/stats
 * Returns aggregate counts across all modules.
 */
adminDashboardRouter.get('/stats', getDashboardStats);

/**
 * GET /admin/dashboard/recent
 * Returns recent activity from all modules.
 * Query params:
 *  - limit: number of items per module (default: 5, max: 20)
 */
adminDashboardRouter.get(
  '/recent',
  validate(dashboardRecentQuerySchema, 'query'),
  getDashboardRecent,
);

export default adminDashboardRouter;
