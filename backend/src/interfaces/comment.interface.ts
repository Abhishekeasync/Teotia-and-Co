/**
 * Comments on blog posts — submitted by public visitors, moderated by admin.
 * Status flow: pending → approved|rejected (soft-delete for removal).
 */

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export type CommentRecord = {
  id: number;
  blogId: number;
  name: string;
  email: string;
  comment: string;
  status: CommentStatus;
  approvedAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
};

/** Public-facing comment (approved only). */
export type PublicComment = {
  id: number;
  name: string;
  comment: string;
  createdAt: string;
};

/** Admin view with moderation metadata. */
export type AdminComment = {
  id: number;
  blogId: number;
  blogSlug: string;
  blogHeading: string;
  name: string;
  email: string;
  comment: string;
  status: CommentStatus;
  approvedAt: string | null;
  createdAt: string;
};
