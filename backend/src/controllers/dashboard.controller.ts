import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const dashboardService = new DashboardService();

/**
 * Get dashboard statistics.
 * Returns aggregate counts across all modules.
 */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getStats();
  return ApiResponse.success(res, { stats }, 'Dashboard statistics retrieved successfully');
});

/**
 * Get recent activity across all modules.
 * Optional limit parameter (default: 5, max: 20).
 */
export const getDashboardRecent = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 5, 1),
    20,
  );

  const recent = await dashboardService.getRecent(limit);
  return ApiResponse.success(res, { recent }, 'Recent activity retrieved successfully');
});
