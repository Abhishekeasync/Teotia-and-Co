import { Router } from 'express';
import authRouter from './auth.routes';
import blogRouter from './blog.routes';
import adminBlogRouter from './adminBlog.routes';
import commentRouter from './comment.routes';
import adminCommentRouter from './adminComment.routes';
import subscriberRouter from './subscriber.routes';
import adminSubscriberRouter from './adminSubscriber.routes';
import enquiryRouter from './enquiry.routes';
import adminEnquiryRouter from './adminEnquiry.routes';
import adminDashboardRouter from './adminDashboard.routes';

const apiV1Router = Router();

// Authentication
apiV1Router.use('/auth', authRouter);

// Public APIs
apiV1Router.use('/blogs', blogRouter);
apiV1Router.use(commentRouter); // Mounts /blogs/:slug/comments
apiV1Router.use('/subscribers', subscriberRouter);
apiV1Router.use('/enquiries', enquiryRouter);

// Admin APIs (require authentication)
apiV1Router.use('/admin/dashboard', adminDashboardRouter);
apiV1Router.use('/admin/blogs', adminBlogRouter);
apiV1Router.use('/admin/comments', adminCommentRouter);
apiV1Router.use('/admin/subscribers', adminSubscriberRouter);
apiV1Router.use('/admin/enquiries', adminEnquiryRouter);

export default apiV1Router;
