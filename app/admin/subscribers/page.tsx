'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminAction, AdminActions } from '@/components/admin/AdminActions';
import { IconTrash } from '@/components/admin/AdminIcons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
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
      <AdminPageHeader
        title="Subscribers"
        description="Newsletter sign-ups from the website"
      />
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <div style={{ padding: '1.25rem' }}>
              <AdminTableSkeleton rows={6} cols={6} />
            </div>
          ) : subscribers.length === 0 ? (
            <AdminEmptyState
              title="No subscribers yet"
              description="Email sign-ups from the newsletter form will appear here."
            />
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
                        <AdminActions>
                          <AdminAction
                            label="Remove"
                            icon={<IconTrash />}
                            variant="danger"
                            disabled={actionId === sub.id}
                            loading={actionId === sub.id}
                            onClick={() => requestSubscriberDelete(sub)}
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
          onPageChange={loadSubscribers}
        />
      </div>
      {deleteDialog}
    </>
  );
}
