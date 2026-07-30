import { Router } from 'express';
import {
  addBlogImages,
  createBlog,
  deleteAllBlogImages,
  deleteBlog,
  deleteBlogImage,
  getAdminBlog,
  listAdminBlogs,
  publishBlog,
  replaceBlogImage,
  unpublishBlog,
  updateBlog,
  uploadBlogImage,
} from '../controllers/adminBlog.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  blogFormUpload,
  blogImagesUpload,
  blogSingleImageUpload,
  normalizeBlogFormBody,
} from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  adminBlogListQuerySchema,
  blogIdParamSchema,
  blogImageParamSchema,
  createBlogBodySchema,
  updateBlogBodySchema,
} from '../validators/blog.validator';

/** Admin blog CRUD — requires auth cookie; includes viewCount on reads. */
const adminBlogRouter = Router();

adminBlogRouter.use(requireAuth);

/**
 * Create draft — accepts JSON or multipart/form-data.
 * Optional files: images (max 5), featuredImage|image, ogImage.
 */
adminBlogRouter.post(
  '/',
  blogFormUpload,
  normalizeBlogFormBody,
  validate(createBlogBodySchema),
  createBlog,
);

adminBlogRouter.get('/list-all-blogs', validate(adminBlogListQuerySchema, 'query'), listAdminBlogs);

/** Upload up to 5 images (returns URLs only — not attached to a blog yet). */
adminBlogRouter.post('/upload-image', blogImagesUpload, uploadBlogImage);

adminBlogRouter.get('/blog/:id', validate(blogIdParamSchema, 'params'), getAdminBlog);

adminBlogRouter.patch(
  '/update-blog/:id',
  blogFormUpload,
  normalizeBlogFormBody,
  validate(blogIdParamSchema, 'params'),
  validate(updateBlogBodySchema),
  updateBlog,
);

adminBlogRouter.delete('/delete-blog/:id', validate(blogIdParamSchema, 'params'), deleteBlog);

/** Append gallery images to a blog (respects remaining slots, max 5 total). */
adminBlogRouter.post(
  '/blog/:id/images',
  validate(blogIdParamSchema, 'params'),
  blogImagesUpload,
  addBlogImages,
);

/** Delete every gallery image for a blog. */
adminBlogRouter.delete(
  '/blog/:id/images',
  validate(blogIdParamSchema, 'params'),
  deleteAllBlogImages,
);

/** Replace one gallery image (multipart field: `image`). */
adminBlogRouter.patch(
  '/blog/:id/images/:imageId',
  validate(blogImageParamSchema, 'params'),
  blogSingleImageUpload,
  replaceBlogImage,
);

/** Delete one gallery image by id. */
adminBlogRouter.delete(
  '/blog/:id/images/:imageId',
  validate(blogImageParamSchema, 'params'),
  deleteBlogImage,
);

adminBlogRouter.post('/:id/publish', validate(blogIdParamSchema, 'params'), publishBlog);
adminBlogRouter.post('/:id/unpublish', validate(blogIdParamSchema, 'params'), unpublishBlog);

export default adminBlogRouter;
