import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { normalizeAuthorFormBody, uploadImageMiddleware } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createAuthorBodySchema, updateAuthorBodySchema } from '../validators/author.validator';
import {
  createAuthor,
  deleteAuthor,
  getAdminAuthor,
  listAdminAuthors,
  updateAuthor,
} from '../controllers/adminAuthor.controller';

const adminAuthorRouter = Router();

adminAuthorRouter.use(requireAuth);

adminAuthorRouter.get('/', listAdminAuthors);
adminAuthorRouter.post(
  '/',
  uploadImageMiddleware.single('image'),
  normalizeAuthorFormBody,
  validate(createAuthorBodySchema),
  createAuthor
);

adminAuthorRouter.get('/:id', getAdminAuthor);
adminAuthorRouter.patch(
  '/:id',
  uploadImageMiddleware.single('image'),
  normalizeAuthorFormBody,
  validate(updateAuthorBodySchema),
  updateAuthor
);
adminAuthorRouter.delete('/:id', deleteAuthor);

export default adminAuthorRouter;
