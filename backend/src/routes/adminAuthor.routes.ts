import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { uploadImageMiddleware } from '../middlewares/upload.middleware';
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
  validate(createAuthorBodySchema),
  createAuthor
);

adminAuthorRouter.get('/:id', getAdminAuthor);
adminAuthorRouter.patch(
  '/:id',
  uploadImageMiddleware.single('image'),
  validate(updateAuthorBodySchema),
  updateAuthor
);
adminAuthorRouter.delete('/:id', deleteAuthor);

export default adminAuthorRouter;
