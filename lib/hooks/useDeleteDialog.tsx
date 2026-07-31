'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { DeleteDialog } from '@/components/admin/DeleteDialog';

type DeleteRequest = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  loadingLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => Promise<void>;
};

export function useDeleteDialog() {
  const [request, setRequest] = useState<DeleteRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const requestDelete = useCallback((options: DeleteRequest) => {
    setRequest(options);
  }, []);

  const close = useCallback(() => {
    if (!loading) setRequest(null);
  }, [loading]);

  const confirm = useCallback(async () => {
    if (!request) return;

    setLoading(true);
    try {
      await request.onConfirm();
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [request]);

  const deleteDialog = (
    <DeleteDialog
      open={request !== null}
      title={request?.title ?? ''}
      description={request?.description ?? ''}
      confirmLabel={request?.confirmLabel}
      loadingLabel={request?.loadingLabel}
      variant={request?.variant}
      loading={loading}
      onConfirm={confirm}
      onClose={close}
    />
  );

  return { requestDelete, deleteDialog };
}
