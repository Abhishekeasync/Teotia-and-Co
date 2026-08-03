'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminAction, AdminActions } from '@/components/admin/AdminActions';
import { IconEdit, IconTrash } from '@/components/admin/AdminIcons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { adminApi } from '@/lib/api/client';
import { ApiAuthorDetail, ApiAuthorListResponse } from '@/lib/api/types';
import { useDeleteDialog } from '@/lib/hooks/useDeleteDialog';

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<ApiAuthorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState<number | null>(null);
  const { requestDelete, deleteDialog } = useDeleteDialog();

  const loadAuthors = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await adminApi.authors.list({ page: pageNum, limit: 20 });
      const data = res as unknown as { data: ApiAuthorListResponse };
      setAuthors(data.data.authors);
      setTotalPages(data.data.pagination.totalPages);
      setPage(data.data.pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const requestAuthorDelete = (author: ApiAuthorDetail) => {
    requestDelete({
      title: 'Delete author',
      description: (
        <>
          Are you sure you want to delete &quot;<strong>{author.name}</strong>
          &quot;?
          <span className="delete-dialog-warning-line">
            They will be removed from all associated blog posts. This action cannot be undone.
          </span>
        </>
      ),
      onConfirm: async () => {
        setActionId(author.id);
        try {
          await adminApi.authors.delete(author.id);
          toast.success('Author deleted');
          await loadAuthors(page);
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
        title="Authors"
        description="Manage blog post authors and profile details"
        primaryAction={{ href: '/admin/authors/new', label: 'New author' }}
      />
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <div style={{ padding: '1.25rem' }}>
              <AdminTableSkeleton rows={6} cols={4} />
            </div>
          ) : authors.length === 0 ? (
            <AdminEmptyState
              title="No authors yet"
              description="Create an author profile to associate with blog posts."
              action={
                <Link href="/admin/authors/new" className="admin-btn admin-btn-primary admin-btn-sm">
                  Create author
                </Link>
              }
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.map((author) => (
                    <tr key={author.id}>
                      <td>
                        <div className="admin-table-avatar">
                          {author.profileImageUrl ? (
                            <img src={author.profileImageUrl} alt="" />
                          ) : (
                            <span className="admin-table-avatar-placeholder">
                              {author.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <Link href={`/admin/authors/${author.id}/edit`}>
                          {author.name}
                        </Link>
                        {author.slug && (
                          <div className="admin-cell-muted">{author.slug}</div>
                        )}
                      </td>
                      <td className="admin-cell-muted">
                        {author.designation || '—'}
                      </td>
                      <td>
                        <AdminActions>
                          <AdminAction
                            label="Edit"
                            icon={<IconEdit />}
                            href={`/admin/authors/${author.id}/edit`}
                          />
                          <AdminAction
                            label="Delete"
                            icon={<IconTrash />}
                            variant="danger"
                            disabled={actionId === author.id}
                            loading={actionId === author.id}
                            onClick={() => requestAuthorDelete(author)}
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
          onPageChange={loadAuthors}
        />
      </div>
      {deleteDialog}
    </>
  );
}
