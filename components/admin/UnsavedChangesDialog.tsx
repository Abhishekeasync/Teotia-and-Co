'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type UnsavedChangesDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onContinue: () => void;
  onReset: () => void;
  onLeave: () => void;
};

export function UnsavedChangesDialog({
  open,
  title = 'Unsaved changes',
  description = 'Your changes will be lost if you leave now.',
  onContinue,
  onReset,
  onLeave,
}: UnsavedChangesDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onContinue();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onContinue]);

  if (!open) return null;

  return createPortal(
    <div className="unsaved-dialog-portal">
      <div
        className="unsaved-dialog-backdrop"
        onClick={onContinue}
        role="presentation"
      >
        <div
          className="unsaved-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="unsaved-dialog-title"
          aria-describedby="unsaved-dialog-description"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="unsaved-dialog-header">
            <span className="unsaved-dialog-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h3 id="unsaved-dialog-title">{title}</h3>
              <p id="unsaved-dialog-description">{description}</p>
            </div>
          </div>

          <div className="unsaved-dialog-actions">
            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={onContinue}
            >
              Continue
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-warning admin-btn-sm"
              onClick={onReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-danger admin-btn-sm"
              onClick={onLeave}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
