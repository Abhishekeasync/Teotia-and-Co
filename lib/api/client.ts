/**
 * API Client for TEOTIA & CO. Blog CMS
 * Handles all HTTP requests to the backend with proper error handling
 */

import { ApiAuthorListResponse, ApiError, ApiSuccess } from './types';

// Determine if we're on the server or client
const isServer = typeof window === 'undefined';

/** Resolve API base URL at request time so Vercel runtime env vars are respected. */
function getApiUrl(): string {
  if (!isServer) {
    return '/api/v1';
  }

  const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, '');
  if (backendUrl) {
    return `${backendUrl}/api/v1`;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}/api/v1`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  if (siteUrl) {
    return `${siteUrl}/api/v1`;
  }

  return 'http://127.0.0.1:5000/api/v1';
}

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  /** Seconds to cache public GET responses via Next.js Data Cache. */
  revalidate?: number | false;
}

/**
 * Generic fetch wrapper with error handling and cookie support.
 * Automatically includes credentials for authenticated requests.
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = false, revalidate, ...fetchOptions } = options;

  const url = `${getApiUrl()}${endpoint}`;
  const isFormData = fetchOptions.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...fetchOptions.headers,
  };

  // Include cookies for authenticated requests
  const credentials = requireAuth ? 'include' : 'same-origin';

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials,
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new ApiClientError(
        response.status,
        error.error?.message || 'Request failed',
        error.error?.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or parsing error
    throw new ApiClientError(
      500,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

/**
 * Public API methods (no authentication required)
 */
export const publicApi = {
  // Health check
  health: () => fetchApi('/health'),

  // Blog APIs
  blogs: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      tag?: string;
      author?: string;
      sort?: 'latest' | 'oldest' | 'popular';
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      if (params?.category) query.set('category', params.category);
      if (params?.tag) query.set('tag', params.tag);
      if (params?.author) query.set('author', params.author);
      if (params?.sort) query.set('sort', params.sort);

      return fetchApi(`/blogs?${query.toString()}`, { revalidate: 120 });
    },

    getBySlug: (slug: string) => fetchApi(`/blogs/${slug}`, { revalidate: 300 }),

    getShareLinks: (slug: string) => fetchApi(`/blogs/${slug}/share`),
  },

  // Author APIs
  authors: {
    getBySlug: (slug: string) => fetchApi(`/authors/${slug}`),
  },

  // Category APIs
  categories: {
    list: () => fetchApi('/categories'),
  },

  // Comment APIs
  comments: {
    list: (slug: string, params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      return fetchApi(`/blogs/${slug}/comments?${query.toString()}`);
    },

    create: (slug: string, data: { name: string; email: string; comment: string }) =>
      fetchApi(`/blogs/${slug}/comment`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Subscriber APIs
  subscribers: {
    subscribe: (data: { email: string; name?: string }) =>
      fetchApi('/subscribers/subscribe-to-newsletter', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    unsubscribe: (token: string) =>
      fetchApi(`/subscribers/unsubscribe?token=${token}`, {
        method: 'GET',
      }),
  },

  // Enquiry APIs
  enquiries: {
    getServiceTypes: () => fetchApi('/enquiries/service-types'),

    create: (data: {
      name: string;
      email: string;
      phone: string;
      serviceType: string;
      subject: string;
      message: string;
    }) =>
      fetchApi('/enquiries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

/**
 * Admin API methods (authentication required)
 */
export const adminApi = {
  // Auth APIs
  auth: {
    login: (data: { email: string; password: string }) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      }),

    verifyOtp: (data: { email: string; otp: string }) =>
      fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      }),

    resendOtp: (data: { email: string }) =>
      fetchApi('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      }),

    me: () => fetchApi('/auth/me', { requireAuth: true }),

    logout: () =>
      fetchApi('/auth/logout', {
        method: 'POST',
        requireAuth: true,
      }),
  },

  // Dashboard APIs
  dashboard: {
    getStats: () => fetchApi('/admin/dashboard/stats', { requireAuth: true }),

    getRecent: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : '';
      return fetchApi(`/admin/dashboard/recent${query}`, { requireAuth: true });
    },
  },

  // Blog APIs
  blogs: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      excludeId?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      if (params?.excludeId) query.set('excludeId', params.excludeId.toString());

      return fetchApi(`/admin/blogs/list-all-blogs?${query.toString()}`, {
        requireAuth: true,
      });
    },

    getById: (id: number) =>
      fetchApi(`/admin/blogs/blog/${id}`, { requireAuth: true }),

    create: (data: FormData) =>
      fetchApi('/admin/blogs', {
        method: 'POST',
        body: data,
        requireAuth: true,
        headers: {}, // Let browser set Content-Type for FormData
      }),

    update: (id: number, data: FormData) =>
      fetchApi(`/admin/blogs/update-blog/${id}`, {
        method: 'PATCH',
        body: data,
        requireAuth: true,
        headers: {}, // Let browser set Content-Type for FormData
      }),

    delete: (id: number) =>
      fetchApi(`/admin/blogs/delete-blog/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      }),

    publish: (id: number) =>
      fetchApi(`/admin/blogs/${id}/publish`, {
        method: 'POST',
        requireAuth: true,
      }),

    unpublish: (id: number) =>
      fetchApi(`/admin/blogs/${id}/unpublish`, {
        method: 'POST',
        requireAuth: true,
      }),

    uploadImage: (data: FormData) =>
      fetchApi('/admin/blogs/upload-image', {
        method: 'POST',
        body: data,
        requireAuth: true,
        headers: {},
      }),

    addGalleryImages: (id: number, data: FormData) =>
      fetchApi(`/admin/blogs/blog/${id}/images`, {
        method: 'POST',
        body: data,
        requireAuth: true,
        headers: {},
      }),

    deleteGalleryImage: (blogId: number, imageId: number) =>
      fetchApi(`/admin/blogs/blog/${blogId}/images/${imageId}`, {
        method: 'DELETE',
        requireAuth: true,
      }),
  },

  // Author APIs
  authors: {
    list: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      return fetchApi<ApiSuccess<ApiAuthorListResponse>>(`/admin/authors?${query.toString()}`, {
        requireAuth: true,
      });
    },

    search: (params?: { query?: string; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.query) query.set('query', params.query);
      if (params?.limit) query.set('limit', params.limit.toString());

      return fetchApi(`/admin/authors/search?${query.toString()}`, {
        requireAuth: true,
      });
    },

    getById: (id: number) =>
      fetchApi(`/admin/authors/${id}`, { requireAuth: true }),

    create: (data: FormData) =>
      fetchApi('/admin/authors', {
        method: 'POST',
        body: data,
        requireAuth: true,
        headers: {},
      }),

    update: (id: number, data: FormData) =>
      fetchApi(`/admin/authors/${id}`, {
        method: 'PATCH',
        body: data,
        requireAuth: true,
        headers: {},
      }),

    delete: (id: number) =>
      fetchApi(`/admin/authors/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      }),
  },

  // Comment APIs
  comments: {
    list: (params?: { page?: number; limit?: number; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.status) query.set('status', params.status);

      return fetchApi(`/admin/comments?${query.toString()}`, { requireAuth: true });
    },

    approve: (id: number) =>
      fetchApi(`/admin/comments/${id}/approve-comment`, {
        method: 'PATCH',
        requireAuth: true,
      }),

    reject: (id: number) =>
      fetchApi(`/admin/comments/${id}/reject-comment`, {
        method: 'PATCH',
        requireAuth: true,
      }),

    delete: (id: number) =>
      fetchApi(`/admin/comments/delete-comment/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      }),
  },

  // Subscriber APIs
  subscribers: {
    list: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      return fetchApi(`/admin/subscribers?${query.toString()}`, {
        requireAuth: true,
      });
    },

    delete: (id: number) =>
      fetchApi(`/admin/subscribers/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      }),
  },

  // Enquiry APIs
  enquiries: {
    list: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      return fetchApi(`/admin/enquiries/list-all-enquiries?${query.toString()}`, {
        requireAuth: true,
      });
    },

    getById: (id: number) =>
      fetchApi(`/admin/enquiries/enquiry-detail/${id}`, { requireAuth: true }),

    delete: (id: number) =>
      fetchApi(`/admin/enquiries/delete-enquiry/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      }),
  },
};
