import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  HTTP_STATUS,
  MAX_LIMIT,
  MAX_PAGE,
} from '../constants';
import { ApiError } from './ApiError';

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

function parsePositiveInt(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }

  const floored = Math.floor(num);
  if (floored <= 0 || !Number.isSafeInteger(floored)) {
    return fallback;
  }

  return floored;
}

export function parsePaginationQuery(query: {
  page?: unknown;
  limit?: unknown;
}): PaginationParams {
  const page = Math.min(parsePositiveInt(query.page, DEFAULT_PAGE), MAX_PAGE);
  const limit = Math.min(parsePositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  const offset = (page - 1) * limit;

  if (!Number.isSafeInteger(offset)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid pagination offset');
  }

  return {
    page,
    limit,
    offset,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
  };
}
