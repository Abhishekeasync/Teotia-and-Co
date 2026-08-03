'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { toast } from '@/lib/toast';
import { getCroppedImage } from '@/lib/utils/cropImage';

export type ImageCropModalProps = {
  open: boolean;
  imageSrc: string;
  title?: string;
  onClose: () => void;
  onCropComplete: (file: File, previewUrl: string) => void;
};

export function ImageCropModal({
  open,
  imageSrc,
  title = 'Crop profile photo',
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setProcessing(false);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !processing) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, processing, onClose]);

  const onCropChange = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels, rotation);
      const previewUrl = URL.createObjectURL(blob);
      const file = new File([blob], 'profile-photo.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      onCropComplete(file, previewUrl);
      onClose();
    } catch {
      toast.error('Could not crop image. Try choosing the photo again.');
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="admin-modal-backdrop"
      onClick={processing ? undefined : onClose}
      role="presentation"
    >
      <div
        className="admin-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-crop-modal-header">
          <div>
            <h3 id="image-crop-title">{title}</h3>
            <p className="admin-crop-modal-desc">
              Drag to reposition. Use zoom and rotation to fine-tune the square crop.
            </p>
          </div>
          <button
            type="button"
            className="admin-crop-modal-close"
            onClick={onClose}
            disabled={processing}
            aria-label="Close crop dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="admin-crop-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropChange}
          />
        </div>

        <div className="admin-crop-controls">
          <div className="admin-crop-control">
            <label htmlFor="crop-zoom">Zoom</label>
            <input
              id="crop-zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <div className="admin-crop-control">
            <label htmlFor="crop-rotation">Rotation</label>
            <input
              id="crop-rotation"
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="admin-crop-modal-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleApply}
            disabled={processing || !croppedAreaPixels}
          >
            {processing ? 'Applying…' : 'Apply crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
