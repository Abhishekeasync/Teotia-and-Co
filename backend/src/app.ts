import express, { Application } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env, isProduction } from './config/env';
import rootRouter from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  const corsOrigins = isProduction
    ? [env.BASE_URL]
    : [env.BASE_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  app.use(
    morgan(isProduction ? 'combined' : 'dev', {
      skip: (req) => req.path === '/health',
    }),
  );

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isProduction ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests',
      errors: ['Rate limit exceeded'],
    },
  });
  app.use(globalLimiter);

  app.use(rootRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
