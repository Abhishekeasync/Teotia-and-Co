'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminAction, AdminActions } from '@/components/admin/AdminActions';
import { IconEye, IconTrash } from '@/components/admin/AdminIcons';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton';
import { EnquiryDetailDialog } from '@/components/admin/EnquiryDetailDialog';
import { adminApi } from '@/lib/api/client';
import { ApiEnquiry, ApiEnquiryListResponse } from '@/lib/api/types';
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

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ApiEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState<number | null>(null);
  const [selected, setSelected] = useState<ApiEnquiry | null>(null);
  const { requestDelete, deleteDialog } = useDeleteDialog();

  const loadEnquiries = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await adminApi.enquiries.list({ page: pageNum, limit: 20 });
      const data = res as { data: ApiEnquiryListResponse };
      setEnquiries(data.data.enquiries);
      setTotalPages(data.data.meta.totalPages);
      setPage(data.data.meta.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const openDetail = async (id: number) => {
    try {
      const res = await adminApi.enquiries.getById(id);
      const data = res as { data: { enquiry: ApiEnquiry } };
      setSelected(data.data.enquiry);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load enquiry');
    }
  };

  const requestEnquiryDelete = (enquiry: ApiEnquiry) => {
    requestDelete({
      title: 'Delete enquiry',
      loadingLabel: 'Deleting…',
      description: enquiry.subject ? (
        <>
          Are you sure you want to delete &quot;<strong>{enquiry.subject}</strong>
          &quot;?
          <span className="delete-dialog-warning-line">
            This action cannot be undone.
          </span>
        </>
      ) : (
        <>
          Are you sure you want to delete this enquiry?
          <span className="delete-dialog-warning-line">
            This action cannot be undone.
          </span>
        </>
      ),
      onConfirm: async () => {
        setActionId(enquiry.id);
        try {
          await adminApi.enquiries.delete(enquiry.id);
          toast.success('Enquiry deleted');
          setSelected(null);
          await loadEnquiries(page);
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
        title="Enquiries"
        description="Contact form submissions from the website"
      />
      <div className="admin-content">
        <div className="admin-panel">
          {loading ? (
            <div style={{ padding: '1.25rem' }}>
              <AdminTableSkeleton rows={6} cols={7} />
            </div>
          ) : enquiries.length === 0 ? (
            <AdminEmptyState
              title="No enquiries yet"
              description="When visitors submit the contact form, their messages will appear here."
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Service</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td>{enquiry.name}</td>
                      <td>{enquiry.email}</td>
                      <td>
                        {enquiry.phone ? (
                          <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{enquiry.serviceType}</td>
                      <td>{enquiry.subject}</td>
                      <td>{formatDate(enquiry.createdAt)}</td>
                      <td>
                        <AdminActions>
                          <AdminAction
                            label="View details"
                            icon={<IconEye />}
                            onClick={() => openDetail(enquiry.id)}
                          />
                          <AdminAction
                            label="Delete"
                            icon={<IconTrash />}
                            variant="danger"
                            disabled={actionId === enquiry.id}
                            loading={actionId === enquiry.id}
                            onClick={() => requestEnquiryDelete(enquiry)}
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
          onPageChange={loadEnquiries}
        />
      </div>

      <EnquiryDetailDialog
        enquiry={selected}
        loading={selected !== null && actionId === selected.id}
        formatDate={formatDate}
        onClose={() => setSelected(null)}
        onDelete={requestEnquiryDelete}
      />
      {deleteDialog}
    </>
  );
}
