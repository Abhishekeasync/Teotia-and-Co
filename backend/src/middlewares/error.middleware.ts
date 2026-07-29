import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { HTTP_STATUS, MAX_BLOG_IMAGES } from '../constants';
import { env } from '../config/env';
import { logger } from '../utils/logger';

type MySqlError = Error & { code?: string; errno?: number; sqlMessage?: string };

function isMySqlError(error: unknown): error is MySqlError {
  return error instanceof Error && 'code' in error && typeof (error as MySqlError).code === 'string';
}

function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return `${path}: ${issue.message}`;
  });
}

function mapMySqlError(error: MySqlError): ApiError | null {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return new ApiError(HTTP_STATUS.CONFLICT, 'Duplicate entry', [error.sqlMessage ?? error.message]);
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_ROW_IS_REFERENCED_2':
      return new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid reference', [error.message]);
    case 'ECONNREFUSED':
    case 'ER_ACCESS_DENIED_ERROR':
    case 'ER_BAD_DB_ERROR':
      return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Database error', ['Database unavailable']);
    default:
      return null;
  }
}

function mapJwtError(error: Error): ApiError | null {
  if (error.name === 'JsonWebTokenError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token expired');
  }
  return null;
}

function mapMulterError(error: Error & { code?: string }): ApiError | null {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, 'File too large');
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Unexpected file field. For /upload-image use images (or image), up to 5 files. For create/update use images, featuredImage, image, or ogImage.',
    );
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Too many files. Maximum is ${MAX_BLOG_IMAGES} images.`,
    );
  }
  return null;
}

export const notFoundHandler = (_req: Request, res: Response): Response =>
  ApiResponse.fail(res, 'Route not found', HTTP_STATUS.NOT_FOUND);

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (err instanceof ZodError) {
    const errors = formatZodErrors(err);
    return ApiResponse.fail(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
  }

  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error('Non-operational API error', { message: err.message, stack: err.stack });
    }
    return ApiResponse.fail(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof Error) {
    const jwtError = mapJwtError(err);
    if (jwtError) {
      return ApiResponse.fail(res, jwtError.message, jwtError.statusCode, jwtError.errors);
    }

    const multerError = mapMulterError(err as Error & { code?: string });
    if (multerError) {
      return ApiResponse.fail(res, multerError.message, multerError.statusCode, multerError.errors);
    }

    if (err.name === 'SyntaxError' && 'body' in err) {
      return ApiResponse.fail(res, 'Invalid JSON body', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (isMySqlError(err)) {
    const mapped = mapMySqlError(err);
    if (mapped) {
      logger.error('MySQL error', { code: err.code, message: err.message });
      return ApiResponse.fail(res, mapped.message, mapped.statusCode, mapped.errors);
    }
    logger.error('Unhandled MySQL error', { code: err.code, message: err.message });
    return ApiResponse.fail(
      res,
      env.NODE_ENV === 'production' ? 'Database error' : err.message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error('Unhandled error', {
    message,
    stack: err instanceof Error ? err.stack : undefined,
  });

  return ApiResponse.fail(
    res,
    env.NODE_ENV === 'production' ? 'Internal server error' : message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
};
