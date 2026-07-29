import { Router } from 'express';
import healthRouter from './health.routes';
import apiV1Router from './api.v1.routes';

const rootRouter = Router();

rootRouter.use('/health', healthRouter);
rootRouter.use('/api/v1', apiV1Router);

export default rootRouter;
