import { Router } from 'express';
import {
  approveComment,
  deleteComment,
  listAdminComments,
  rejectComment,
} from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  adminCommentListQuerySchema,
  commentIdParamSchema,
} from '../validators/comment.validator';

/** Admin comment moderation — requires auth cookie. */
const adminCommentRouter = Router();

adminCommentRouter.use(requireAuth);

/** List all comments with optional status filter. */
adminCommentRouter.get(
  '/',
  validate(adminCommentListQuerySchema, 'query'),
  listAdminComments,
);

/** Approve a comment. */
adminCommentRouter.patch(
  '/:id/approve-comment',
  validate(commentIdParamSchema, 'params'),
  approveComment,
);

/** Reject a comment. */
adminCommentRouter.patch(
  '/:id/reject-comment',
  validate(commentIdParamSchema, 'params'),
  rejectComment,
);

/** Delete a comment. */
adminCommentRouter.delete(
  '/delete-comment/:id',
  validate(commentIdParamSchema, 'params'),
  deleteComment,
);

export default adminCommentRouter;
