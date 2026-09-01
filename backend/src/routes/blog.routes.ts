import { Router } from 'express';
import {
  getBlogShareLinks,
  getPublicBlogBySlug,
  listPublicBlogs,
  recordBlogView,
} from '../controllers/blog.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  blogSlugParamSchema,
  publicBlogListQuerySchema,
  blogViewBodySchema,
} from '../validators/blog.validator';

/** Public blog APIs — published only; never exposes viewCount. */
const blogRouter = Router();

blogRouter.get('/', validate(publicBlogListQuerySchema, 'query'), listPublicBlogs);
blogRouter.get('/:slug/share', validate(blogSlugParamSchema, 'params'), getBlogShareLinks);
blogRouter.get('/:slug', validate(blogSlugParamSchema, 'params'), getPublicBlogBySlug);
blogRouter.post('/:slug/view', validate(blogSlugParamSchema, 'params'), validate(blogViewBodySchema, 'body'), recordBlogView);

export default blogRouter;
