import { BlogRepository } from '../repositories/blog.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { SubscriberRepository } from '../repositories/subscriber.repository';
import { EnquiryRepository } from '../repositories/enquiry.repository';
import {
  DashboardStats,
  DashboardRecent,
  RecentBlog,
  RecentComment,
  RecentSubscriber,
  RecentEnquiry,
} from '../interfaces/dashboard.interface';

/**
 * Dashboard service - aggregates statistics and recent activity from all modules.
 * Used by admin UI to display overview and activity feed.
 */
export class DashboardService {
  private blogRepository = new BlogRepository();
  private commentRepository = new CommentRepository();
  private subscriberRepository = new SubscriberRepository();
  private enquiryRepository = new EnquiryRepository();

  /**
   * Get aggregate statistics across all modules.
   * Executes multiple count queries in parallel for performance.
   */
  async getStats(): Promise<DashboardStats> {
    const [
      blogStats,
      commentStats,
      subscriberStats,
      totalEnquiries,
    ] = await Promise.all([
      this.getBlogStats(),
      this.getCommentStats(),
      this.getSubscriberStats(),
      this.enquiryRepository.countAll(),
    ]);

    return {
      blogs: blogStats,
      comments: commentStats,
      subscribers: subscriberStats,
      enquiries: {
        total: totalEnquiries,
      },
    };
  }

  /**
   * Get recent activity from all modules.
   * Fetches latest items for activity feed.
   */
  async getRecent(limit = 5): Promise<DashboardRecent> {
    const [blogs, comments, subscribers, enquiries] = await Promise.all([
      this.getRecentBlogs(limit),
      this.getRecentComments(limit),
      this.getRecentSubscribers(limit),
      this.getRecentEnquiries(limit),
    ]);

    return {
      blogs,
      comments,
      subscribers,
      enquiries,
    };
  }

  /**
   * Blog statistics - total, published, draft counts.
   */
  private async getBlogStats() {
    const [total, published, draft] = await Promise.all([
      this.blogRepository.countAll(),
      this.blogRepository.countPublished(),
      this.blogRepository.countDrafts(),
    ]);

    return { total, published, draft };
  }

  /**
   * Comment statistics - total and breakdown by status.
   */
  private async getCommentStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.commentRepository.countAdmin({}),
      this.commentRepository.countAdmin({ status: 'pending' }),
      this.commentRepository.countAdmin({ status: 'approved' }),
      this.commentRepository.countAdmin({ status: 'rejected' }),
    ]);

    return { total, pending, approved, rejected };
  }

  /**
   * Subscriber statistics - total, active, unsubscribed counts.
   */
  private async getSubscriberStats() {
    const allSubscribers = await this.subscriberRepository.listAll({
      page: 1,
      limit: 100000, // Get all for counting
      offset: 0,
    });

    const total = allSubscribers.length;
    const active = allSubscribers.filter((s) => s.unsubscribedAt === null).length;
    const unsubscribed = allSubscribers.filter((s) => s.unsubscribedAt !== null).length;

    return { total, active, unsubscribed };
  }

  /**
   * Get recent blogs (all statuses) for activity feed.
   */
  private async getRecentBlogs(limit: number): Promise<RecentBlog[]> {
    const blogs = await this.blogRepository.listAdmin({ page: 1, limit, offset: 0 });

    return blogs.map((blog) => ({
      id: blog.id,
      heading: blog.heading,
      slug: blog.slug,
      status: blog.status,
      viewCount: blog.viewCount,
      createdAt: blog.createdAt.toISOString(),
    }));
  }

  /**
   * Get recent comments (all statuses) for activity feed.
   */
  private async getRecentComments(limit: number): Promise<RecentComment[]> {
    const comments = await this.commentRepository.listAdmin(
      {},
      { page: 1, limit, offset: 0 },
    );

    return comments.map((comment) => ({
      id: comment.id,
      blogId: comment.blogId,
      blogHeading: comment.blogHeading,
      name: comment.name,
      comment: comment.comment,
      status: comment.status,
      createdAt: comment.createdAt.toISOString(),
    }));
  }

  /**
   * Get recent subscribers for activity feed.
   */
  private async getRecentSubscribers(limit: number): Promise<RecentSubscriber[]> {
    const subscribers = await this.subscriberRepository.listAll({
      page: 1,
      limit,
      offset: 0,
    });

    return subscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name,
      createdAt: subscriber.createdAt.toISOString(),
    }));
  }

  /**
   * Get recent enquiries for activity feed.
   */
  private async getRecentEnquiries(limit: number): Promise<RecentEnquiry[]> {
    const enquiries = await this.enquiryRepository.listAll({
      page: 1,
      limit,
      offset: 0,
    });

    return enquiries.map((enquiry) => ({
      id: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      serviceType: enquiry.serviceType,
      subject: enquiry.subject,
      createdAt: enquiry.createdAt.toISOString(),
    }));
  }
}
