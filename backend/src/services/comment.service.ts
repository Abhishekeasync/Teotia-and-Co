import { CommentRepository } from '../repositories/comment.repository';
import { BlogRepository } from '../repositories/blog.repository';
import { AdminComment, CommentStatus, PublicComment } from '../interfaces/comment.interface';
import { PaginationParams, buildPaginationMeta, PaginationMeta } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../constants';

export type CreateCommentInput = {
  name: string;
  email: string;
  comment: string;
};

/**
 * Comment service — public submission, admin moderation (approve/reject/delete).
 */
export class CommentService {
  private commentRepository = new CommentRepository();
  private blogRepository = new BlogRepository();

  /**
   * Submit a new comment on a published blog post.
   * Comment starts in 'pending' status and requires admin approval.
   */
  async createComment(
    blogSlug: string,
    input: CreateCommentInput,
  ): Promise<{ message: string }> {
    // Verify blog exists and is published
    const blog = await this.blogRepository.findBySlug(blogSlug);
    if (!blog || blog.status !== 'published' || blog.deletedAt) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }

    await this.commentRepository.create({
      blogId: blog.id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      comment: input.comment.trim(),
    });

    return {
      message: 'Comment submitted and is pending approval',
    };
  }

  /**
   * List approved comments for a blog post (public view).
   */
  async listPublicComments(
    blogSlug: string,
    pagination: PaginationParams,
  ): Promise<{ comments: PublicComment[]; meta: PaginationMeta }> {
    const blog = await this.blogRepository.findBySlug(blogSlug);
    if (!blog || blog.status !== 'published' || blog.deletedAt) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }

    const [comments, total] = await Promise.all([
      this.commentRepository.listApprovedByBlog(blog.id, pagination),
      this.commentRepository.countApprovedByBlog(blog.id),
    ]);

    const publicComments: PublicComment[] = comments.map((c) => ({
      id: c.id,
      name: c.name,
      comment: c.comment,
      createdAt: c.createdAt.toISOString(),
    }));

    return {
      comments: publicComments,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Admin: List all comments with optional status filter.
   */
  async listAdminComments(
    filters: { status?: CommentStatus },
    pagination: PaginationParams,
  ): Promise<{ comments: AdminComment[]; meta: PaginationMeta }> {
    const [comments, total] = await Promise.all([
      this.commentRepository.listAdmin(filters, pagination),
      this.commentRepository.countAdmin(filters),
    ]);

    const adminComments: AdminComment[] = comments.map((c) => ({
      id: c.id,
      blogId: c.blogId,
      blogSlug: c.blogSlug,
      blogHeading: c.blogHeading,
      name: c.name,
      email: c.email,
      comment: c.comment,
      status: c.status,
      approvedAt: c.approvedAt ? c.approvedAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
    }));

    return {
      comments: adminComments,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Admin: Approve a pending comment.
   */
  async approveComment(id: number): Promise<AdminComment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment || comment.deletedAt) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');
    }

    if (comment.status === 'approved') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Comment is already approved');
    }

    await this.commentRepository.updateStatus(id, 'approved');

    const updated = await this.commentRepository.findById(id);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');
    }

    const blog = await this.blogRepository.findById(updated.blogId);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Associated blog not found');
    }

    return {
      id: updated.id,
      blogId: updated.blogId,
      blogSlug: blog.slug,
      blogHeading: blog.heading,
      name: updated.name,
      email: updated.email,
      comment: updated.comment,
      status: updated.status,
      approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Admin: Reject a comment and soft-delete it.
   * Rejected comments are marked as 'rejected' for audit trail, then soft-deleted.
   */
  async rejectComment(id: number): Promise<AdminComment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment || comment.deletedAt) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');
    }

    if (comment.status === 'rejected') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Comment is already rejected');
    }

    const blog = await this.blogRepository.findById(comment.blogId);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Associated blog not found');
    }

    // Set status to rejected for audit trail, then soft-delete
    await this.commentRepository.updateStatus(id, 'rejected');
    await this.commentRepository.softDelete(id);

    // Return the comment details before deletion (for confirmation to admin)
    return {
      id: comment.id,
      blogId: comment.blogId,
      blogSlug: blog.slug,
      blogHeading: blog.heading,
      name: comment.name,
      email: comment.email,
      comment: comment.comment,
      status: 'rejected',
      approvedAt: null,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  /**
   * Admin: Soft-delete a comment.
   */
  async deleteComment(id: number): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment || comment.deletedAt) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');
    }

    await this.commentRepository.softDelete(id);
  }
}
