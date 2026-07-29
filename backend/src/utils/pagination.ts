import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants';

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
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
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
