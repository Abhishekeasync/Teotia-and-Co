'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
      <header className="admin-header">
        <h2>Blogs</h2>
        <Link href="/admin/blogs/new" className="admin-btn admin-btn-primary">
          New blog post
        </Link>
      </header>
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <p className="admin-empty">Loading blogs…</p>
          ) : blogs.length === 0 ? (
            <p className="admin-empty">
              No blogs yet.{' '}
              <Link href="/admin/blogs/new">Create your first post</Link>
            </p>
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
                        <span className={`admin-badge ${blog.status}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>{blog.viewCount ?? 0}</td>
                      <td>{formatDate(blog.publishedAt)}</td>
                      <td>
                        <div className="admin-btn-group">
                          <Link
                            href={`/admin/blogs/edit/${blog.id}`}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            disabled={actionId === blog.id}
                            onClick={() => handlePublishToggle(blog)}
                          >
                            {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          {blog.status === 'published' && (
                            <Link
                              href={`/blog/${blog.slug}`}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              target="_blank"
                            >
                              View
                            </Link>
                          )}
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            disabled={actionId === blog.id}
                            onClick={() => requestBlogDelete(blog)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-btn-group">
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page <= 1 || loading}
              onClick={() => loadBlogs(page - 1)}
            >
              Previous
            </button>
            <span style={{ alignSelf: 'center', fontSize: '0.875rem' }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page >= totalPages || loading}
              onClick={() => loadBlogs(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {deleteDialog}
    </>
  );
}
