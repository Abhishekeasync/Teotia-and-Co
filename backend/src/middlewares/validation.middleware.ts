import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Express 5: `req.query` / `req.params` are getter-only — cannot assign directly.
 * Redefine the property with the Zod-parsed value so controllers still read `req.query`.
 */
function assignValidated(req: Request, target: ValidationTarget, data: unknown): void {
  if (target === 'body') {
    req.body = data;
    return;
  }

  Object.defineProperty(req, target, {
    value: data,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

export const validate =
  (schema: ZodSchema, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    assignValidated(req, target, result.data);
    next();
  };
