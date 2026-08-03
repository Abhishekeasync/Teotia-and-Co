'use client';

import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { adminApi } from '@/lib/api/client';
import { appendQueryParam } from '@/lib/admin/blogDraft';
import { ApiAuthorDetail } from '@/lib/api/types';
import { ImageCropModal } from '@/components/admin/ImageCropModal';

interface AuthorFormProps {
  initialData?: ApiAuthorDetail;
  returnTo?: string | null;
}

function resolveReturnPath(returnTo?: string | null) {
  if (returnTo && returnTo.startsWith('/admin')) {
    return returnTo;
  }
  return '/admin/authors';
}

export function AuthorForm({ initialData, returnTo }: AuthorFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData);
  const backPath = resolveReturnPath(returnTo);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initialData?.name ?? '');
  const [designation, setDesignation] = useState(initialData?.designation ?? '');
  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [facebookUrl, setFacebookUrl] = useState(initialData?.facebookUrl ?? '');
  const [twitterUrl, setTwitterUrl] = useState(initialData?.twitterUrl ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedinUrl ?? '');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.profileImageUrl ?? null
  );
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCropModal = (src: string) => {
    setCropSource(src);
    setCropModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      openCropModal(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (file: File, previewUrl: string) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Cropped image must be less than 2MB. Try zooming out.');
      return;
    }

    setImageFile(file);
    setImagePreview(previewUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAdjustCrop = async () => {
    if (!imagePreview) return;

    try {
      let source = imagePreview;

      if (imageFile) {
        source = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(imageFile);
        });
      } else if (
        !imagePreview.startsWith('data:') &&
        !imagePreview.startsWith('blob:')
      ) {
        const response = await fetch(imagePreview);
        if (!response.ok) {
          throw new Error('Failed to load image');
        }
        const blob = await response.blob();
        source = URL.createObjectURL(blob);
      }

      openCropModal(source);
    } catch {
      toast.error('Could not load image for cropping. Upload a new photo instead.');
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCropSource(null);
    setCropModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeCropModal = () => {
    setCropModalOpen(false);
    setCropSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (designation.trim()) formData.append('designation', designation.trim());
      if (bio.trim()) formData.append('bio', bio.trim());
      if (facebookUrl.trim()) formData.append('facebookUrl', facebookUrl.trim());
      if (twitterUrl.trim()) formData.append('twitterUrl', twitterUrl.trim());
      if (linkedinUrl.trim()) formData.append('linkedinUrl', linkedinUrl.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEdit && initialData) {
        await adminApi.authors.update(initialData.id, formData);
        toast.success('Author updated');
        router.push(backPath);
      } else {
        const res = await adminApi.authors.create(formData);
        toast.success('Author created');
        const data = res as { data?: { author?: { id: number } } };
        const newId = data.data?.author?.id;
        if (newId && backPath.startsWith('/admin/blogs')) {
          router.push(appendQueryParam(backPath, 'newAuthorId', String(newId)));
        } else {
          router.push(backPath);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save author');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-grid">
        <section className="admin-form-section">
          <h3 className="admin-form-section-title">Profile photo</h3>
          <div className="admin-avatar-upload">
            <div className="admin-avatar-preview" aria-hidden>
              {imagePreview ? (
                <img src={imagePreview} alt="" />
              ) : (
                <span className="admin-avatar-placeholder">
                  {name.trim() ? name.trim().charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
            <div className="admin-avatar-upload-actions">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="admin-file-input-hidden"
                id="author-profile-image"
              />
              <div className="admin-btn-group">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose photo
                </button>
                {imagePreview && (
                  <>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={handleAdjustCrop}
                    >
                      Crop
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={clearImage}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <p className="admin-field-hint">
                Square crop, max 2MB. Output is saved at 800×800px.
              </p>
            </div>
          </div>
        </section>

        <section className="admin-form-section">
          <h3 className="admin-form-section-title">Basic information</h3>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="designation">Designation</label>
              <input
                id="designation"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Partner"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="A short biography about the author"
              />
              <p className="admin-field-hint">
                Shown on author profiles and blog bylines.
              </p>
            </div>
          </div>
        </section>

        <section className="admin-form-section">
          <h3 className="admin-form-section-title">Social profiles</h3>
          <p className="admin-form-section-desc">
            Optional links displayed on the author&apos;s public profile.
          </p>
          <div className="admin-social-fields">
            <div className="admin-field">
              <label htmlFor="linkedinUrl">LinkedIn</label>
              <input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="admin-field">
              <label htmlFor="twitterUrl">Twitter</label>
              <input
                id="twitterUrl"
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>

            <div className="admin-field">
              <label htmlFor="facebookUrl">Facebook</label>
              <input
                id="facebookUrl"
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </section>
      </div>

      {cropSource && (
        <ImageCropModal
          open={cropModalOpen}
          imageSrc={cropSource}
          onClose={closeCropModal}
          onCropComplete={handleCropComplete}
        />
      )}

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create author'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          disabled={saving}
          onClick={() => router.push(backPath)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
