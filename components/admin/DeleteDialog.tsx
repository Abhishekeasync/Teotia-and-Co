'use client';

import { useEffect, type ReactNode } from 'react';

export type DeleteDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loadingLabel,
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: DeleteDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="delete-dialog-backdrop"
      onClick={loading ? undefined : onClose}
      role="presentation"
    >
      <div
        className={`delete-dialog delete-dialog--${variant}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`delete-dialog-icon delete-dialog-icon--${variant}`} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="delete-dialog-body">
          <h3 id="delete-dialog-title">{title}</h3>
          <p id="delete-dialog-description">{description}</p>
        </div>

        <div className="delete-dialog-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-btn ${
              variant === 'warning' ? 'admin-btn-warning' : 'admin-btn-danger'
            }`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? loadingLabel ?? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
