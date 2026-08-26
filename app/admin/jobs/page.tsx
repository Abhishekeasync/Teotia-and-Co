'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminAction, AdminActions } from '@/components/admin/AdminActions';
import {
  IconEdit,
  IconExternal,
  IconFileText,
  IconPublish,
  IconTrash,
  IconUnpublish,
} from '@/components/admin/AdminIcons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { adminApi } from '@/lib/api/client';
import { ApiJob, ApiJobListResponse } from '@/lib/api/types';
import { useDeleteDialog } from '@/lib/hooks/useDeleteDialog';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionState, setActionState] = useState<{ id: number; type: 'status' | 'delete' } | null>(null);
  const { requestDelete, deleteDialog } = useDeleteDialog();

  const loadJobs = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await adminApi.jobs.list({ page: pageNum, limit: 20 });
      const data = res as { data: ApiJobListResponse };
      setJobs(data.data.jobs);
      setTotalPages(data.data.meta.totalPages);
      setPage(data.data.meta.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleStatusToggle = async (job: ApiJob) => {
    setActionState({ id: job.id, type: 'status' });
    try {
      const newStatus = job.status === 'published' ? 'draft' : 'published';
      await adminApi.jobs.updateStatus(job.id, newStatus);
      toast.success(newStatus === 'published' ? 'Job Published' : 'Job Unpublished');
      await loadJobs(page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionState(null);
    }
  };

  const requestJobDelete = (job: ApiJob) => {
    requestDelete({
      title: 'Delete Job',
      description: (
        <>
          Are you sure you want to delete &quot;<strong>{job.title}</strong>
          &quot;?
          <span className="delete-dialog-warning-line">
            This action cannot be undone.
          </span>
        </>
      ),
      onConfirm: async () => {
        setActionState({ id: job.id, type: 'delete' });
        try {
          await adminApi.jobs.delete(job.id);
          toast.success('Job deleted');
          await loadJobs(page);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Delete failed');
          throw err;
        } finally {
          setActionState(null);
        }
      },
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Jobs"
        description="Create and manage job postings"
        primaryAction={{ href: '/admin/jobs/new', label: 'New Job' }}
      />
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <div style={{ padding: '1.25rem' }}>
              <AdminTableSkeleton rows={6} cols={6} />
            </div>
          ) : jobs.length === 0 ? (
            <AdminEmptyState
              title="No jobs yet"
              description="Create your first job posting to start hiring."
              action={
                <Link href="/admin/jobs/new" className="admin-btn admin-btn-primary admin-btn-sm">
                  Create job
                </Link>
              }
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Work Mode</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const isStatusToggle = actionState?.id === job.id && actionState.type === 'status';
                    const isDeleting = actionState?.id === job.id && actionState.type === 'delete';
                    const isBusy = isStatusToggle || isDeleting;

                    return (
                      <tr key={job.id}>
                        <td>
                          <Link href={`/admin/jobs/edit/${job.id}`}>
                            {job.title}
                          </Link>
                        </td>
                        <td>{job.department || '—'}</td>
                        <td>{job.workMode}</td>
                        <td>
                          <span className={`admin-badge ${job.status}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>{formatDate(job.publishedAt)}</td>
                        <td>
                          <AdminActions>
                            <AdminAction
                              label="Edit"
                              icon={<IconEdit />}
                              href={`/admin/jobs/edit/${job.id}`}
                            />
                            <AdminAction
                              label={job.status === 'published' ? 'Unpublish' : 'Publish'}
                              icon={job.status === 'published' ? <IconUnpublish /> : <IconPublish />}
                              variant={job.status === 'published' ? 'warning' : 'success'}
                              disabled={isBusy}
                              loading={isStatusToggle}
                              onClick={() => handleStatusToggle(job)}
                            />
                            <AdminAction
                              label="Applications"
                              icon={<IconFileText />}
                              href={`/admin/applications?jobId=${job.id}`}
                            />
                            {job.status === 'published' && (
                              <AdminAction
                                label="View live"
                                icon={<IconExternal />}
                                href={`/careers/${job.slug}`}
                                target="_blank"
                              />
                            )}
                            <AdminAction
                              label="Delete"
                              icon={<IconTrash />}
                              variant="danger"
                              disabled={isBusy}
                              loading={isDeleting}
                              onClick={() => requestJobDelete(job)}
                            />
                          </AdminActions>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          loading={loading}
          onPageChange={loadJobs}
        />
      </div>
      {deleteDialog}
    </>
  );
}
