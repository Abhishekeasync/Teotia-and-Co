'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BlogGalleryUpload, GalleryImage } from '@/components/admin/BlogGalleryUpload';
import { BlogPreview } from '@/components/admin/BlogPreview';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { adminApi, publicApi } from '@/lib/api/client';
import { normalizeApiBlog } from '@/lib/api/normalize';
import { ApiBlog } from '@/lib/api/types';
import { useAuth } from '@/lib/hooks/useAuth';

type CategoryOption = { id: number; name: string };

type BlogFormProps = {
  blogId?: number;
  initial?: ApiBlog | null;
};

export function BlogForm({ blogId, initial }: BlogFormProps) {
  const router = useRouter();
  const { admin } = useAuth();
  const isEdit = Boolean(blogId);

  const [heading, setHeading] = useState(initial?.heading ?? '');
  const [shortDescription, setShortDescription] = useState(
    initial?.shortDescription ?? ''
  );
  const [body, setBody] = useState(initial?.body ?? '');
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId?.toString() ?? ''
  );
  const [tagNames, setTagNames] = useState(
    initial?.tags?.join(', ') ?? ''
  );
  const [authorName, setAuthorName] = useState(
    initial?.authorName ?? admin?.name ?? ''
  );
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? ''
  );
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? '');
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [ogFile, setOgFile] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    initial?.galleryImages ?? []
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const parsedTags = useMemo(
    () =>
      tagNames
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagNames]
  );

  const selectedCategoryName =
    categories.find((cat) => String(cat.id) === categoryId)?.name ??
    initial?.categoryName;

  const featuredPreviewUrl = useMemo(() => {
    if (featuredFile) return URL.createObjectURL(featuredFile);
    return initial?.featuredImageUrl ?? null;
  }, [featuredFile, initial?.featuredImageUrl]);

  useEffect(() => {
    if (admin?.name && !initial?.authorName) {
      setAuthorName(admin.name);
    }
  }, [admin, initial?.authorName]);

  useEffect(() => {
    async function loadCategories() {
      const map = new Map<number, string>();

      if (initial?.categoryId && initial.categoryName) {
        map.set(initial.categoryId, initial.categoryName);
      }

      try {
        const res = await publicApi.blogs.list({ limit: 100 });
        const data = res as { data: { blogs: unknown[] } };
        const blogs = (data.data?.blogs ?? []).map((blog) => normalizeApiBlog(blog as Parameters<typeof normalizeApiBlog>[0]));
        for (const blog of blogs) {
          if (blog.categoryId && blog.categoryName) {
            map.set(blog.categoryId, blog.categoryName);
          }
        }
      } catch {
        // Categories fallback below
      }

      if (map.size === 0) {
        map.set(1, 'General');
      }

      setCategories(
        Array.from(map.entries()).map(([id, name]) => ({ id, name }))
      );

      if (!categoryId && map.size > 0) {
        setCategoryId(String(Array.from(map.keys())[0]));
      }
    }

    loadCategories();
  }, [initial]);

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('heading', heading.trim());
    formData.append('shortDescription', shortDescription.trim());
    formData.append('body', body);
    formData.append('categoryId', categoryId);
    formData.append('authorName', authorName.trim() || 'TEOTIA & CO.');

    if (parsedTags.length > 0) {
      formData.append('tagNames', JSON.stringify(parsedTags));
    }

    const galleryUrls = galleryImages.map((image) => image.imageUrl);
    if (galleryUrls.length > 0) {
      formData.append('imageUrls', JSON.stringify(galleryUrls));
    }

    if (metaTitle.trim()) formData.append('metaTitle', metaTitle.trim());
    if (metaDescription.trim()) {
      formData.append('metaDescription', metaDescription.trim());
    }
    if (canonicalUrl.trim()) formData.append('canonicalUrl', canonicalUrl.trim());
    if (featuredFile) formData.append('featuredImage', featuredFile);
    if (ogFile) formData.append('ogImage', ogFile);

    return formData;
  };

  useEffect(() => {
    if (!showPreview) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowPreview(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showPreview]);

  const save = async (publishAfter = false) => {
    if (!heading.trim() || !shortDescription.trim() || !body.trim()) {
      toast.error('Heading, description, and body are required');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);
    try {
      const formData = buildFormData();
      let savedId = blogId;

      if (isEdit && blogId) {
        await adminApi.blogs.update(blogId, formData);
        toast.success('Blog updated');
      } else {
        const res = await adminApi.blogs.create(formData);
        const data = res as { data: { blog: unknown } };
        savedId = normalizeApiBlog(data.data.blog as Parameters<typeof normalizeApiBlog>[0]).id;
        toast.success('Blog saved as draft');
      }

      if (publishAfter && savedId) {
        await adminApi.blogs.publish(savedId);
        toast.success('Blog published');
      }

      router.push('/admin/blogs');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save(false);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-grid">
        <div className="admin-field">
          <label htmlFor="heading">Heading</label>
          <input
            id="heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor="shortDescription">Short description</label>
          <textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            rows={3}
          />
        </div>

        <div className="admin-field">
          <div className="admin-field-row">
            <label>Body</label>
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => setShowPreview(true)}
            >
              Show preview
            </button>
          </div>
          <RichTextEditor content={body} onChange={setBody} />
        </div>

        {showPreview && (
          <div
            className="admin-modal-backdrop admin-preview-backdrop"
            role="presentation"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="admin-preview-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="blog-preview-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="admin-preview-modal-header">
                <h3 id="blog-preview-title">Blog preview</h3>
                <button
                  type="button"
                  className="admin-preview-close"
                  aria-label="Close preview"
                  onClick={() => setShowPreview(false)}
                >
                  ×
                </button>
              </header>
              <div className="admin-preview-modal-body">
                <BlogPreview
                  heading={heading}
                  shortDescription={shortDescription}
                  body={body}
                  tags={parsedTags}
                  authorName={authorName}
                  categoryName={selectedCategoryName}
                  featuredImageUrl={featuredPreviewUrl}
                  galleryImages={galleryImages}
                />
              </div>
            </div>
          </div>
        )}

        <div className="admin-field">
          <label htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="admin-field-hint">
            Categories are loaded from existing blog posts. Ensure at least one
            category exists in the database.
          </p>
        </div>

        <div className="admin-field">
          <label htmlFor="tagNames">Tags</label>
          <input
            id="tagNames"
            value={tagNames}
            onChange={(e) => setTagNames(e.target.value)}
            placeholder="tax, compliance, audit"
          />
          <p className="admin-field-hint">Comma-separated tag names</p>
          {parsedTags.length > 0 && (
            <p className="admin-tag-preview">
              Preview: {parsedTags.map((tag) => `#${tag}`).join(' · ')}
            </p>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="authorName">Author name</label>
          <input
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>

        <div className="admin-field">
          <label htmlFor="featuredImage">Featured image</label>
          <input
            id="featuredImage"
            type="file"
            accept="image/*"
            onChange={(e) => setFeaturedFile(e.target.files?.[0] ?? null)}
          />
          {featuredPreviewUrl && (
            <img
              src={featuredPreviewUrl}
              alt="Featured preview"
              className="admin-image-preview"
            />
          )}
        </div>

        <BlogGalleryUpload
          blogId={blogId}
          images={galleryImages}
          onChange={setGalleryImages}
        />

        <div className="admin-field">
          <label htmlFor="ogImage">OG image (optional)</label>
          <input
            id="ogImage"
            type="file"
            accept="image/*"
            onChange={(e) => setOgFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            SEO settings
          </summary>
          <div className="admin-form-grid" style={{ marginTop: '1rem' }}>
            <div className="admin-field">
              <label htmlFor="metaTitle">Meta title</label>
              <input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="metaDescription">Meta description</label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="canonicalUrl">Canonical URL</label>
              <input
                id="canonicalUrl"
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
              />
            </div>
          </div>
        </details>
      </div>

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-secondary"
          disabled={saving}
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save draft'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          disabled={saving}
          onClick={() => save(true)}
        >
          {saving ? 'Saving…' : isEdit ? 'Save & publish' : 'Save & publish'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => router.push('/admin/blogs')}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
