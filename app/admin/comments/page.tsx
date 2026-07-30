'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/client';
import {
  ApiAdminComment,
  ApiAdminCommentListResponse,
} from '@/lib/api/types';
import { useDeleteDialog } from '@/lib/hooks/useDeleteDialog';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CommentsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';

  const [comments, setComments] = useState<ApiAdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState<number | null>(null);
  const { requestDelete, deleteDialog } = useDeleteDialog();
  const { requestDelete: requestReject, deleteDialog: rejectDialog } =
    useDeleteDialog();

  const loadComments = async (pageNum = page, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.comments.list({
        page: pageNum,
        limit: 20,
        status: status || undefined,
      });
      const data = res as { data: ApiAdminCommentListResponse };
      setComments(data.data.comments);
      setTotalPages(data.data.meta.totalPages);
      setPage(data.data.meta.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(1, statusFilter);
  }, [statusFilter]);

  const runApprove = async (id: number) => {
    setActionId(id);
    try {
      await adminApi.comments.approve(id);
      toast.success('Comment approved');
      await loadComments(page, statusFilter);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const requestCommentReject = (comment: ApiAdminComment) => {
    requestReject({
      title: 'Reject comment',
      variant: 'warning',
      confirmLabel: 'Reject',
      loadingLabel: 'Rejecting…',
      description: (
        <>
          Reject comment from <strong>{comment.name}</strong>{' '}on &quot;
          <strong>{comment.blogHeading}</strong>&quot;?
          <span className="delete-dialog-warning-line">
            This comment will be hidden from the public blog.
          </span>
        </>
      ),
      onConfirm: async () => {
        setActionId(comment.id);
        try {
          await adminApi.comments.reject(comment.id);
          toast.success('Comment rejected');
          await loadComments(page, statusFilter);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Reject failed');
          throw err;
        } finally {
          setActionId(null);
        }
      },
    });
  };

  const requestCommentDelete = (comment: ApiAdminComment) => {
    requestDelete({
      title: 'Delete comment',
      loadingLabel: 'Deleting…',
      description: (
        <>
          Are you sure you want to delete this comment?
          <span className="delete-dialog-warning-line">
            This action cannot be undone.
          </span>
        </>
      ),
      onConfirm: async () => {
        setActionId(comment.id);
        try {
          await adminApi.comments.delete(comment.id);
          toast.success('Comment deleted');
          await loadComments(page, statusFilter);
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
        <h2>Comments</h2>
        <div className="admin-filters">
          <select
            value={statusFilter}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set('status', e.target.value);
              else url.searchParams.delete('status');
              window.location.href = url.toString();
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </header>
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <p className="admin-empty">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="admin-empty">No comments found</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Blog</th>
                    <th>Comment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td>
                        <div>{comment.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>
                          {comment.email}
                        </div>
                      </td>
                      <td>
                        <Link href={`/blog/${comment.blogSlug}`} target="_blank">
                          {comment.blogHeading}
                        </Link>
                      </td>
                      <td style={{ maxWidth: 280 }}>{comment.comment}</td>
                      <td>
                        <span className={`admin-badge ${comment.status}`}>
                          {comment.status}
                        </span>
                      </td>
                      <td>{formatDate(comment.createdAt)}</td>
                      <td>
                        <div className="admin-btn-group">
                          {comment.status !== 'approved' && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              disabled={actionId === comment.id}
                              onClick={() => runApprove(comment.id)}
                            >
                              Approve
                            </button>
                          )}
                          {comment.status !== 'rejected' && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              disabled={actionId === comment.id}
                              onClick={() => requestCommentReject(comment)}
                            >
                              Reject
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            disabled={actionId === comment.id}
                            onClick={() => requestCommentDelete(comment)}
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
              onClick={() => loadComments(page - 1, statusFilter)}
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
              onClick={() => loadComments(page + 1, statusFilter)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {deleteDialog}
      {rejectDialog}
    </>
  );
}

export default function AdminCommentsPage() {
  return (
    <Suspense fallback={<div className="admin-loading">Loading…</div>}>
      <CommentsContent />
    </Suspense>
  );
}
