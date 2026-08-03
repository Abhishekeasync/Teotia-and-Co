import { Request, Response } from 'express';
import { AuthorService } from '../services/author.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const authorService = new AuthorService();

export const getPublicAuthorBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const author = await authorService.getPublicBySlug(slug);
  return ApiResponse.success(res, { author }, '');
});
