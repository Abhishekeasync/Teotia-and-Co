'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDashboardSkeleton } from '@/components/admin/AdminSkeleton';
import { adminApi } from '@/lib/api/client';
import {
  ApiDashboardRecent,
  ApiDashboardStats,
} from '@/lib/api/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ApiDashboardStats['stats'] | null>(null);
  const [recent, setRecent] = useState<ApiDashboardRecent['recent'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          adminApi.dashboard.getStats(),
          adminApi.dashboard.getRecent(5),
        ]);
        const statsData = statsRes as { data: ApiDashboardStats };
        const recentData = recentRes as { data: ApiDashboardRecent };
        setStats(statsData.data.stats);
        setRecent(recentData.data.recent);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of content, engagement, and inbound enquiries"
        primaryAction={{ href: '/admin/blogs/new', label: 'New blog post' }}
      />
      <div className="admin-content admin-content-full">
        {loading ? (
          <AdminDashboardSkeleton />
        ) : (
          <>
            {stats && (
              <div className="admin-stats">
                <Link href="/admin/blogs" className="admin-stat-card admin-stat-card-link">
                  <h3>Blogs</h3>
                  <div className="value">{stats.blogs.total}</div>
                  <div className="sub">
                    {stats.blogs.published} published · {stats.blogs.draft} drafts
                  </div>
                </Link>
                <Link href="/admin/comments" className="admin-stat-card admin-stat-card-link">
                  <h3>Comments</h3>
                  <div className="value">{stats.comments.pending}</div>
                  <div className="sub">
                    pending · {stats.comments.approved} approved
                  </div>
                </Link>
                <Link href="/admin/subscribers" className="admin-stat-card admin-stat-card-link">
                  <h3>Subscribers</h3>
                  <div className="value">{stats.subscribers.active}</div>
                  <div className="sub">
                    active · {stats.subscribers.unsubscribed} unsubscribed
                  </div>
                </Link>
                <Link href="/admin/enquiries" className="admin-stat-card admin-stat-card-link">
                  <h3>Enquiries</h3>
                  <div className="value">{stats.enquiries.total}</div>
                  <div className="sub">contact form submissions</div>
                </Link>
              </div>
            )}

            {recent && (
              <div className="admin-recent-grid">
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h3>Recent blogs</h3>
                    <Link href="/admin/blogs">View all</Link>
                  </div>
                  <div className="admin-panel-body">
                    {recent.blogs.length === 0 ? (
                      <AdminEmptyState
                        title="No blog posts yet"
                        description="Publish your first article to appear here."
                        action={
                          <Link href="/admin/blogs/new" className="admin-btn admin-btn-primary admin-btn-sm">
                            Create post
                          </Link>
                        }
                      />
                    ) : (
                      recent.blogs.map((blog) => (
                        <div key={blog.id} className="admin-recent-item">
                          <Link href={`/admin/blogs/edit/${blog.id}`}>
                            {blog.heading}
                          </Link>
                          <div className="meta">
                            <span className={`admin-badge ${blog.status}`}>
                              {blog.status}
                            </span>{' '}
                            · {formatDate(blog.createdAt)} · {blog.viewCount} views
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h3>Recent comments</h3>
                    <Link href="/admin/comments">View all</Link>
                  </div>
                  <div className="admin-panel-body">
                    {recent.comments.length === 0 ? (
                      <AdminEmptyState
                        title="No comments yet"
                        description="Reader comments will show up here once submitted."
                      />
                    ) : (
                      recent.comments.map((comment) => (
                        <div key={comment.id} className="admin-recent-item">
                          <strong>{comment.name}</strong> on {comment.blogHeading}
                          <div className="meta">
                            {comment.comment.slice(0, 80)}
                            {comment.comment.length > 80 ? '…' : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h3>Recent enquiries</h3>
                    <Link href="/admin/enquiries">View all</Link>
                  </div>
                  <div className="admin-panel-body">
                    {recent.enquiries.length === 0 ? (
                      <AdminEmptyState
                        title="No enquiries yet"
                        description="Contact form submissions from the website will appear here."
                      />
                    ) : (
                      recent.enquiries.map((enquiry) => (
                        <div key={enquiry.id} className="admin-recent-item">
                          <strong>{enquiry.name}</strong> — {enquiry.subject}
                          <div className="meta">
                            {enquiry.serviceType} · {formatDate(enquiry.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
