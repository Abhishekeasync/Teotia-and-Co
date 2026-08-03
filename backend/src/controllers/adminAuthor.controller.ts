import { Request, Response } from 'express';
import { AuthorService, CreateAuthorInput, UpdateAuthorInput } from '../services/author.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePaginationQuery } from '../utils/pagination';

const authorService = new AuthorService();

export const createAuthor = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateAuthorInput;
  const author = await authorService.createAuthor(body, req.file);
  return ApiResponse.success(res, { author }, 'Author created', 201);
});

export const listAdminAuthors = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePaginationQuery(req.query);
  const result = await authorService.listAdmin(pagination);
  return ApiResponse.success(res, result, '');
});

export const getAdminAuthor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const author = await authorService.getAdminById(Number(id));
  return ApiResponse.success(res, { author }, '');
});

export const updateAuthor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateAuthorInput;
  const author = await authorService.updateAuthor(Number(id), body, req.file);
  return ApiResponse.success(res, { author }, 'Author updated');
});

export const deleteAuthor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await authorService.deleteAuthor(Number(id));
  return ApiResponse.success(res, {}, 'Author deleted');
});
