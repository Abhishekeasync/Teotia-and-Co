import { Router } from 'express';
import {
  createComment,
  listPublicComments,
} from '../controllers/comment.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  createCommentBodySchema,
  commentListQuerySchema,
} from '../validators/comment.validator';
import { blogSlugParamSchema } from '../validators/blog.validator';

/** Public comment APIs — submit and list approved comments on blogs. */
const commentRouter = Router();

/** Submit a comment on a blog post (requires moderation). */
commentRouter.post(
  '/blogs/:slug/comment',
  validate(blogSlugParamSchema, 'params'),
  validate(createCommentBodySchema),
  createComment,
);

/** List approved comments for a blog post. */
commentRouter.get(
  '/blogs/:slug/comments',
  validate(blogSlugParamSchema, 'params'),
  validate(commentListQuerySchema, 'query'),
  listPublicComments,
);

export default commentRouter;
