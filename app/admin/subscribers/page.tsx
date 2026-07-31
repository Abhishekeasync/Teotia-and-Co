'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/client';
import { ApiSubscriber, ApiSubscriberListResponse } from '@/lib/api/types';
import { useDeleteDialog } from '@/lib/hooks/useDeleteDialog';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<ApiSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState<number | null>(null);
  const { requestDelete, deleteDialog } = useDeleteDialog();

  const loadSubscribers = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await adminApi.subscribers.list({ page: pageNum, limit: 20 });
      const data = res as { data: ApiSubscriberListResponse };
      setSubscribers(data.data.subscribers);
      setTotalPages(data.data.meta.totalPages);
      setPage(data.data.meta.page);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load subscribers'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const requestSubscriberDelete = (sub: ApiSubscriber) => {
    requestDelete({
      title: 'Remove subscriber',
      description: `Remove ${sub.email} from the newsletter list?`,
      confirmLabel: 'Remove',
      onConfirm: async () => {
        setActionId(sub.id);
        try {
          await adminApi.subscribers.delete(sub.id);
          toast.success('Subscriber removed');
          await loadSubscribers(page);
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
        <h2>Subscribers</h2>
      </header>
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <p className="admin-empty">Loading subscribers…</p>
          ) : subscribers.length === 0 ? (
            <p className="admin-empty">No subscribers yet</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Subscribed</th>
                    <th>Unsubscribed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.email}</td>
                      <td>{sub.name ?? '—'}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            sub.unsubscribedAt ? 'unsubscribed' : 'active'
                          }`}
                        >
                          {sub.unsubscribedAt ? 'Unsubscribed' : 'Active'}
                        </span>
                      </td>
                      <td>{formatDate(sub.createdAt)}</td>
                      <td>{formatDate(sub.unsubscribedAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          disabled={actionId === sub.id}
                          onClick={() => requestSubscriberDelete(sub)}
                        >
                          Delete
                        </button>
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
              onClick={() => loadSubscribers(page - 1)}
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
              onClick={() => loadSubscribers(page + 1)}
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
