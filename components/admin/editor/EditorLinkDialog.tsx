'use client';

import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { isValidEditorLinkUrl, normalizeEditorLinkUrl } from '@/lib/utils/url';

export type EditorLinkDialogProps = {
  open: boolean;
  initialUrl?: string;
  onSubmit: (url: string) => void;
  onRemove?: () => void;
  onClose: () => void;
};

export function EditorLinkDialog({
  open,
  initialUrl = '',
  onSubmit,
  onRemove,
  onClose,
}: EditorLinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setUrl(initialUrl);
    setError(null);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open, initialUrl]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = normalizeEditorLinkUrl(url);
    if (!normalized) {
      setError('Enter a valid URL (https://, http://, mailto:, or tel:)');
      return;
    }
    onSubmit(normalized);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="editor-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-link-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="editor-link-dialog-title" className="editor-dialog-title">
          {initialUrl ? 'Edit link' : 'Insert link'}
        </h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="editor-dialog-label">
            URL
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="url"
            className="editor-dialog-input"
            placeholder="https://example.com"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'editor-link-error' : undefined}
          />
          {error && (
            <p id="editor-link-error" className="editor-dialog-error" role="alert">
              {error}
            </p>
          )}
          <div className="editor-dialog-actions">
            {initialUrl && onRemove && (
              <button
                type="button"
                className="admin-btn admin-btn-danger admin-btn-sm"
                onClick={() => {
                  onRemove();
                  onClose();
                }}
              >
                Remove link
              </button>
            )}
            <div className="editor-dialog-actions-right">
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary admin-btn-sm"
                disabled={!url.trim() || !isValidEditorLinkUrl(url)}
              >
                {initialUrl ? 'Update' : 'Insert'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
