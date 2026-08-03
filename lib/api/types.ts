/**
 * TypeScript types for API responses
 * These match the backend API response structures
 */

// Standard API Response Wrapper
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    statusCode: number;
    message: string;
    details?: unknown;
  };
}

// Pagination Meta
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Author Types
export interface ApiAuthor {
  id: number;
  name: string;
  slug: string;
  designation: string | null;
  profileImageUrl: string | null;
}

export interface ApiAuthorDetail extends ApiAuthor {
  bio: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAuthorListResponse {
  authors: ApiAuthorDetail[];
  pagination: PaginationMeta;
}

// Blog Types
export interface ApiRelatedPost {
  id: number;
  slug: string;
  heading: string;
  shortDescription: string;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  status?: 'draft' | 'published';
}

export interface ApiBlog {
  id: number;
  heading: string;
  slug: string;
  shortDescription: string;
  body: string;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  status: 'draft' | 'published';
  publishType?: 'draft' | 'publish_now' | 'scheduled';
  scheduledPublishAt?: string | null;
  schedulerStatus?: 'pending' | 'published' | 'failed' | 'cancelled' | null;
  publishedAt: string | null;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  /** Tag names (normalized from API string[] or object[]). */
  tags: string[];
  authorName: string; // Deprecated, use authors instead
  authors?: ApiAuthor[];
  createdAt: string;
  updatedAt: string;
  viewCount?: number; // Only in admin responses
  galleryImages?: Array<{
    id: number;
    imageUrl: string;
    displayOrder: number;
  }>;
  relatedPosts?: ApiRelatedPost[];
}

export interface ApiBlogListResponse {
  blogs: ApiBlog[];
  pagination: PaginationMeta;
}

export interface ApiBlogDetailResponse {
  blog: ApiBlog;
}

// Comment Types
export interface ApiComment {
  id: number;
  name: string;
  comment: string;
  createdAt: string;
}

export interface ApiAdminComment {
  id: number;
  blogId: number;
  blogSlug: string;
  blogHeading: string;
  name: string;
  email: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt: string | null;
  createdAt: string;
}

export interface ApiCommentListResponse {
  comments: ApiComment[];
  meta: PaginationMeta;
}

export interface ApiAdminCommentListResponse {
  comments: ApiAdminComment[];
  meta: PaginationMeta;
}

// Subscriber Types
export interface ApiSubscriber {
  id: number;
  email: string;
  name: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}

export interface ApiSubscriberListResponse {
  subscribers: ApiSubscriber[];
  meta: PaginationMeta;
}

// Enquiry Types
export interface ApiEnquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface ApiEnquiryListResponse {
  enquiries: ApiEnquiry[];
  meta: PaginationMeta;
}

export interface ApiServiceTypesResponse {
  serviceTypes: string[];
}

// Dashboard Types
export interface ApiDashboardStats {
  stats: {
    blogs: {
      total: number;
      published: number;
      draft: number;
    };
    comments: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    subscribers: {
      total: number;
      active: number;
      unsubscribed: number;
    };
    enquiries: {
      total: number;
    };
  };
}

export interface ApiDashboardRecent {
  recent: {
    blogs: Array<{
      id: number;
      heading: string;
      slug: string;
      status: 'draft' | 'published';
      viewCount: number;
      createdAt: string;
    }>;
    comments: Array<{
      id: number;
      blogId: number;
      blogHeading: string;
      name: string;
      comment: string;
      status: 'pending' | 'approved' | 'rejected';
      createdAt: string;
    }>;
    subscribers: Array<{
      id: number;
      email: string;
      name: string | null;
      createdAt: string;
    }>;
    enquiries: Array<{
      id: number;
      name: string;
      email: string;
      serviceType: string;
      subject: string;
      createdAt: string;
    }>;
  };
}

// Auth Types
export interface ApiAdmin {
  id: number;
  email: string;
  name: string;
  lastVerifiedAt: string | null;
  createdAt: string;
}

export interface ApiLoginResponse {
  otpRequired?: boolean;
  admin?: ApiAdmin;
  message: string;
}

export interface ApiMeResponse {
  admin: ApiAdmin;
}

// Share Links
export interface ApiBlogShareLinks {
  slug: string;
  pageUrl: string;
  linkedIn: string;
  whatsApp: string;
  x: string;
}

export interface ApiShareLinksResponse {
  share: ApiBlogShareLinks;
}
