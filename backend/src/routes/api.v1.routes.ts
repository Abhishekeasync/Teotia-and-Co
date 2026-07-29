import { Router } from 'express';
import authRouter from './auth.routes';
import blogRouter from './blog.routes';
import adminBlogRouter from './adminBlog.routes';

const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/blogs', blogRouter);
apiV1Router.use('/admin/blogs', adminBlogRouter);

export default apiV1Router;
