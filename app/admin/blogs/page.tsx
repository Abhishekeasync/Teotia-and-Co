'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminAction, AdminActions } from '@/components/admin/AdminActions';
import {
  IconEdit,
  IconExternal,
  IconPublish,
  IconTrash,
  IconUnpublish,
} from '@/components/admin/AdminIcons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { adminApi } from '@/lib/api/client';
import { normalizeApiBlogs } from '@/lib/api/normalize';
import { ApiBlog, ApiBlogListResponse } from '@/lib/api/types';
import { useDeleteDialog } from '@/lib/hooks/useDeleteDialog';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState<number | null>(null);
  const { requestDelete, deleteDialog } = useDeleteDialog();

  const loadBlogs = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await adminApi.blogs.list({ page: pageNum, limit: 20 });
      const data = res as { data: ApiBlogListResponse };
      setBlogs(normalizeApiBlogs(data.data.blogs as Parameters<typeof normalizeApiBlogs>[0]));
      setTotalPages(data.data.pagination.totalPages);
      setPage(data.data.pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handlePublishToggle = async (blog: ApiBlog) => {
    setActionId(blog.id);
    try {
      if (blog.status === 'published') {
        await adminApi.blogs.unpublish(blog.id);
        toast.success('Blog unpublished');
      } else {
        await adminApi.blogs.publish(blog.id);
        toast.success('Blog published');
      }
      await loadBlogs(page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const requestBlogDelete = (blog: ApiBlog) => {
    requestDelete({
      title: 'Delete blog post',
      description: (
        <>
          Are you sure you want to delete &quot;<strong>{blog.heading}</strong>
          &quot;?
          <span className="delete-dialog-warning-line">
            This action cannot be undone.
          </span>
        </>
      ),
      onConfirm: async () => {
        setActionId(blog.id);
        try {
          await adminApi.blogs.delete(blog.id);
          toast.success('Blog deleted');
          await loadBlogs(page);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Delete failed');
          throw err;
        } finally {
          setActionId(null);
        }
      },
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Blogs"
        description="Create, publish, and manage blog posts"
        primaryAction={{ href: '/admin/blogs/new', label: 'New blog post' }}
      />
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <div style={{ padding: '1.25rem' }}>
              <AdminTableSkeleton rows={6} cols={6} />
            </div>
          ) : blogs.length === 0 ? (
            <AdminEmptyState
              title="No blog posts yet"
              description="Write your first article to start publishing on the site."
              action={
                <Link href="/admin/blogs/new" className="admin-btn admin-btn-primary admin-btn-sm">
                  Create post
                </Link>
              }
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id}>
                      <td>
                        <Link href={`/admin/blogs/edit/${blog.id}`}>
                          {blog.heading}
                        </Link>
                      </td>
                      <td>{blog.categoryName}</td>
                      <td>
                        {blog.publishType === 'scheduled' && blog.schedulerStatus === 'pending' ? (
                          <span className="admin-badge warning" title={blog.scheduledPublishAt ? new Date(blog.scheduledPublishAt).toLocaleString() : ''}>
                            Scheduled
                          </span>
                        ) : (
                          <span className={`admin-badge ${blog.status}`}>
                            {blog.status}
                          </span>
                        )}
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {blog.viewCount ?? 0}
                      </td>
                      <td>{formatDate(blog.publishedAt)}</td>
                      <td>
                        <AdminActions>
                          <AdminAction
                            label="Edit"
                            icon={<IconEdit />}
                            href={`/admin/blogs/edit/${blog.id}`}
                          />
                          <AdminAction
                            label={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                            icon={blog.status === 'published' ? <IconUnpublish /> : <IconPublish />}
                            variant={blog.status === 'published' ? 'warning' : 'success'}
                            disabled={actionId === blog.id}
                            loading={actionId === blog.id}
                            onClick={() => handlePublishToggle(blog)}
                          />
                          {blog.status === 'published' && (
                            <AdminAction
                              label="View live"
                              icon={<IconExternal />}
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                            />
                          )}
                          <AdminAction
                            label="Delete"
                            icon={<IconTrash />}
                            variant="danger"
                            disabled={actionId === blog.id}
                            loading={actionId === blog.id}
                            onClick={() => requestBlogDelete(blog)}
                          />
                        </AdminActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          loading={loading}
          onPageChange={loadBlogs}
        />
      </div>
      {deleteDialog}
    </>
  );
}
