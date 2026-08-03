import { Request, Response } from 'express';
import { CategoryRepository } from '../repositories/category.repository';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const categoryRepository = new CategoryRepository();

/** Public: list all blog categories for filters and admin forms. */
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryRepository.listAll();
  return ApiResponse.success(res, { categories }, '');
});
