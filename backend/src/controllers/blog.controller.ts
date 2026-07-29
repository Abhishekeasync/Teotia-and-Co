import { Request, Response } from 'express';
import { BlogService } from '../services/blog.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePaginationQuery } from '../utils/pagination';

const blogService = new BlogService();

export const listPublicBlogs = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as {
    search?: string;
    category?: string;
    tag?: string;
    sort?: 'latest' | 'oldest' | 'popular';
  };
  const pagination = parsePaginationQuery(req.query);
  const result = await blogService.listPublic(
    {
      search: query.search,
      categorySlug: query.category,
      tagName: query.tag,
      sort: query.sort ?? 'latest',
    },
    pagination,
  );
  return ApiResponse.success(res, result, '');
});

export const getPublicBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const blog = await blogService.getPublicBySlug(slug);
  return ApiResponse.success(res, { blog }, '');
});

export const getBlogShareLinks = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const share = await blogService.getShareLinks(slug);
  return ApiResponse.success(res, { share }, '');
});
