'use client';

import { ChangeEvent, DragEvent, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/client';

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export type EditorImageDialogProps = {
  open: boolean;
  replaceMode?: boolean;
  onInsert: (urls: string[]) => void;
  onClose: () => void;
};

type PreviewItem = {
  id: string;
  file: File;
  previewUrl: string;
};

function isImageFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

async function uploadFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const res = await adminApi.blogs.uploadImage(formData);
  const data = res as { data: { urls: string[] } };
  return data.data.urls ?? [];
}

export function EditorImageDialog({
  open,
  replaceMode = false,
  onInsert,
  onClose,
}: EditorImageDialogProps) {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setItems((current) => {
        if (current.length === 0) return current;
        current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return [];
      });
      setDragOver(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !uploading) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, uploading, onClose]);

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files).filter(isImageFile);
    if (incoming.length === 0) {
      toast.error('Please choose JPEG, PNG, or WebP images');
      return;
    }

    const limit = replaceMode ? 1 : MAX_IMAGES;
    setItems((current) => {
      const remaining = limit - current.length;
      if (remaining <= 0) {
        toast.error(`You can add at most ${limit} image${limit === 1 ? '' : 's'}`);
        return current;
      }

      const next = incoming.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      if (incoming.length > remaining) {
        toast.message(`Only ${remaining} more image(s) can be added`);
      }

      return replaceMode ? next : [...current, ...next];
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const handleInsert = async () => {
    if (items.length === 0) {
      toast.error('Add at least one image');
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadFiles(items.map((item) => item.file));
      if (urls.length === 0) {
        toast.error('Upload failed — no URLs returned');
        return;
      }
      onInsert(urls);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="editor-dialog-backdrop"
      onClick={uploading ? undefined : onClose}
      role="presentation"
    >
      <div
        className="editor-dialog editor-dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-image-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="editor-image-dialog-title" className="editor-dialog-title">
          {replaceMode ? 'Replace image' : 'Insert images'}
        </h3>

        <div
          className={`editor-image-dropzone${dragOver ? ' is-dragover' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple={!replaceMode}
            className="sr-only"
            onChange={handleFileChange}
          />
          <p>Drag & drop images here, or click to browse</p>
          <p className="editor-dialog-hint">
            {replaceMode ? 'One image' : `Up to ${MAX_IMAGES} images`} · JPEG, PNG, WebP
          </p>
        </div>

        {items.length > 0 && (
          <ul className="editor-image-preview-list">
            {items.map((item, index) => (
              <li key={item.id} className="editor-image-preview-item">
                <img src={item.previewUrl} alt={`Upload preview ${index + 1}`} />
                <button
                  type="button"
                  className="editor-image-preview-remove"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(item.id);
                  }}
                  disabled={uploading}
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="editor-dialog-actions">
          <div className="editor-dialog-actions-right">
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={handleInsert}
              disabled={uploading || items.length === 0}
            >
              {uploading ? 'Uploading…' : replaceMode ? 'Replace' : 'Insert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
