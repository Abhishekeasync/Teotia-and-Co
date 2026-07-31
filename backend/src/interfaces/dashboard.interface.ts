/**
 * Admin dashboard statistics and recent activity.
 */

export type DashboardStats = {
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

export type RecentBlog = {
  id: number;
  heading: string;
  slug: string;
  status: 'draft' | 'published';
  viewCount: number;
  createdAt: string;
};

export type RecentComment = {
  id: number;
  blogId: number;
  blogHeading: string;
  name: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type RecentSubscriber = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
};

export type RecentEnquiry = {
  id: number;
  name: string;
  email: string;
  serviceType: string;
  subject: string;
  createdAt: string;
};

export type DashboardRecent = {
  blogs: RecentBlog[];
  comments: RecentComment[];
  subscribers: RecentSubscriber[];
  enquiries: RecentEnquiry[];
};
