'use client';

import { useEffect } from 'react';
import { ApiEnquiry } from '@/lib/api/types';

type EnquiryDetailDialogProps = {
  enquiry: ApiEnquiry | null;
  loading?: boolean;
  onClose: () => void;
  onDelete: (enquiry: ApiEnquiry) => void;
  formatDate: (iso: string) => string;
};

export function EnquiryDetailDialog({
  enquiry,
  loading = false,
  onClose,
  onDelete,
  formatDate,
}: EnquiryDetailDialogProps) {
  useEffect(() => {
    if (!enquiry) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [enquiry, loading, onClose]);

  if (!enquiry) return null;

  return (
    <div
      className="enquiry-detail-backdrop"
      onClick={loading ? undefined : onClose}
      role="presentation"
    >
      <div
        className="enquiry-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="enquiry-detail-header">
          <div className="enquiry-detail-header-text">
            <span className="enquiry-detail-badge">{enquiry.serviceType}</span>
            <h3 id="enquiry-detail-title">{enquiry.subject}</h3>
            <p className="enquiry-detail-meta">
              Submitted {formatDate(enquiry.createdAt)}
            </p>
          </div>
          <button
            type="button"
            className="enquiry-detail-close"
            aria-label="Close"
            disabled={loading}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="enquiry-detail-grid">
          <div className="enquiry-detail-field">
            <span className="enquiry-detail-label">Name</span>
            <span className="enquiry-detail-value">{enquiry.name}</span>
          </div>
          <div className="enquiry-detail-field">
            <span className="enquiry-detail-label">Phone</span>
            <a className="enquiry-detail-link" href={`tel:${enquiry.phone}`}>
              {enquiry.phone}
            </a>
          </div>
          <div className="enquiry-detail-field enquiry-detail-field--full">
            <span className="enquiry-detail-label">Email</span>
            <a className="enquiry-detail-link" href={`mailto:${enquiry.email}`}>
              {enquiry.email}
            </a>
          </div>
        </div>

        <div className="enquiry-detail-message">
          <span className="enquiry-detail-label">Message</span>
          <div className="enquiry-detail-message-box">{enquiry.message}</div>
        </div>

        <div className="enquiry-detail-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={loading}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            disabled={loading}
            onClick={() => onDelete(enquiry)}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
