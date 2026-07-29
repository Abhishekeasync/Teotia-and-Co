import { Response } from 'express';
import { ApiErrorDetail } from './ApiError';

export type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type FailureResponse = {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
};

export class ApiResponse {
  static success<T>(res: Response, data: T, message = '', statusCode = 200): Response {
    const body: SuccessResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(body);
  }

  static fail(
    res: Response,
    message: string,
    statusCode = 400,
    errors: ApiErrorDetail[] = [],
  ): Response {
    const body: FailureResponse = {
      success: false,
      message,
      errors: errors.length > 0 ? errors : [message],
    };
    return res.status(statusCode).json(body);
  }
}
