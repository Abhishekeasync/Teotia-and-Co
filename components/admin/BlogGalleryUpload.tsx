'use client';

import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/client';
import { normalizeApiBlog, type RawApiBlog } from '@/lib/api/normalize';

const MAX_GALLERY = 5;
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export type GalleryImage = {
  id: number;
  imageUrl: string;
  displayOrder: number;
};

type BlogGalleryUploadProps = {
  blogId?: number;
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
};

function isImage(file: File) {
  return ACCEPTED.includes(file.type);
}

function galleryFromBlogResponse(blog: unknown): GalleryImage[] {
  return normalizeApiBlog(blog as RawApiBlog).galleryImages ?? [];
}

function createLocalGalleryId(): number {
  return Date.now() + Math.floor(Math.random() * 1_000_000);
}

export function BlogGalleryUpload({
  blogId,
  images,
  onChange,
}: BlogGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_GALLERY - images.length;

  const uploadFiles = async (files: File[]) => {
    const valid = files.filter(isImage).slice(0, remaining);
    if (valid.length === 0) {
      toast.error('Choose JPEG, PNG, or WebP images');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      valid.forEach((file) => formData.append('images', file));

      if (blogId) {
        const res = await adminApi.blogs.addGalleryImages(blogId, formData);
        const data = res as { data: { blog: unknown } };
        onChange(galleryFromBlogResponse(data.data.blog));
        toast.success('Gallery images added');
      } else {
        const res = await adminApi.blogs.uploadImage(formData);
        const data = res as { data: { urls: string[] } };
        const next = [
          ...images,
          ...data.data.urls.map((url, index) => ({
            id: createLocalGalleryId() + index,
            imageUrl: url,
            displayOrder: images.length + index,
          })),
        ];
        onChange(next.slice(0, MAX_GALLERY));
        toast.success('Images uploaded');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    await uploadFiles(Array.from(event.target.files));
    event.target.value = '';
  };

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) {
      await uploadFiles(Array.from(event.dataTransfer.files));
    }
  };

  const removeImage = async (image: GalleryImage) => {
    if (blogId && image.id > 0) {
      setUploading(true);
      try {
        const res = await adminApi.blogs.deleteGalleryImage(blogId, image.id);
        const data = res as { data: { blog: unknown } };
        onChange(galleryFromBlogResponse(data.data.blog));
        toast.success('Image removed');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Delete failed');
      } finally {
        setUploading(false);
      }
      return;
    }

    onChange(images.filter((item) => item.id !== image.id));
  };

  return (
    <div className="admin-gallery-upload">
      <label className="admin-field-label">Gallery images (optional)</label>
      <p className="admin-field-hint">
        Up to {MAX_GALLERY} images · order preserved · separate from inline body images
      </p>

      {images.length > 0 && (
        <ul className="admin-gallery-list">
          {images.map((image, index) => (
            <li key={image.id} className="admin-gallery-item">
              <span className="admin-gallery-order">{index + 1}</span>
              <img src={image.imageUrl} alt={`Gallery ${index + 1}`} />
              <button
                type="button"
                className="admin-gallery-remove"
                onClick={(event) => {
                  event.stopPropagation();
                  removeImage(image);
                }}
                disabled={uploading}
                aria-label={`Remove gallery image ${index + 1}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div
          className={`admin-gallery-dropzone${dragOver ? ' is-dragover' : ''}`}
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
            type="file"
            accept={ACCEPTED.join(',')}
            multiple
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p>{uploading ? 'Uploading…' : 'Drag & drop or click to add gallery images'}</p>
          <p className="admin-field-hint">{remaining} slot(s) remaining</p>
        </div>
      )}
    </div>
  );
}
