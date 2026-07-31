import { Request, Response } from 'express';
import { CommentService, CreateCommentInput } from '../services/comment.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePaginationQuery } from '../utils/pagination';
import { CommentStatus } from '../interfaces/comment.interface';

const commentService = new CommentService();

/** Public: Submit a comment on a blog post. */
export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const body = req.body as CreateCommentInput;

  const result = await commentService.createComment(slug, body);

  return ApiResponse.success(res, {}, result.message, 201);
});

/** Public: List approved comments for a blog post. */
export const listPublicComments = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const pagination = parsePaginationQuery(req.query);

  const result = await commentService.listPublicComments(slug, pagination);

  return ApiResponse.success(res, result, '');
});

/** Admin: List all comments with optional status filter. */
export const listAdminComments = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query as { status?: CommentStatus };
  const pagination = parsePaginationQuery(req.query);

  const result = await commentService.listAdminComments({ status }, pagination);

  return ApiResponse.success(res, result, '');
});

/** Admin: Approve a comment. */
export const approveComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const comment = await commentService.approveComment(Number(id));

  return ApiResponse.success(res, { comment }, 'Comment approved');
});

/** Admin: Reject a comment (also soft-deletes it). */
export const rejectComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const comment = await commentService.rejectComment(Number(id));

  return ApiResponse.success(res, { comment }, 'Comment rejected and deleted');
});

/** Admin: Delete a comment. */
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await commentService.deleteComment(Number(id));

  return ApiResponse.success(res, {}, 'Comment deleted');
});
