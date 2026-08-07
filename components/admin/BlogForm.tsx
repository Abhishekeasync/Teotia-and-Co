'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import {
  applyBlogDraft,
  blogSnapshotsEqual,
  clearBlogDraft,
  cloneBlogSnapshot,
  readBlogDraft,
  writeBlogDraft,
  type BlogDraftSnapshot,
} from '@/lib/admin/blogDraft';
import { useAdminNavigationGuard, useRegisterNavigationGuard } from '@/lib/hooks/AdminNavigationGuard';
import { BlogGalleryUpload, GalleryImage } from '@/components/admin/BlogGalleryUpload';
import { BlogPreview } from '@/components/admin/BlogPreview';
import { AuthorPicker, AuthorPickerAuthor } from '@/components/admin/AuthorPicker';
import { RelatedPostsField, RelatedPostItem } from '@/components/admin/RelatedPostsField';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { adminApi, publicApi } from '@/lib/api/client';
import { ApiBlog } from '@/lib/api/types';
import { useAuth } from '@/lib/hooks/useAuth';

type CategoryOption = { id: number; name: string };

type BlogFormProps = {
  blogId?: number;
  initial?: ApiBlog | null;
};

/** Convert a UTC ISO string (or Date) to the format datetime-local expects: YYYY-MM-DDTHH:MM in local time. */
function toLocalDatetimeString(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function validateScheduledPublishAt(value: string): string | null {
  if (!value.trim()) {
    return 'Please select a date and time for scheduled publishing';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Scheduled publish time is invalid';
  }
  if (parsed.getTime() <= Date.now()) {
    return 'Scheduled publish time must be in the future';
  }
  return null;
}

export function BlogForm({ blogId, initial }: BlogFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { navigateWithoutGuard } = useAdminNavigationGuard();
  const { admin } = useAuth();
  const isEdit = Boolean(blogId);
  const [draftReady, setDraftReady] = useState(false);
  const baselineRef = useRef<BlogDraftSnapshot | null>(null);

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
  const [authorIds, setAuthorIds] = useState<number[]>(
    initial?.authors?.map(a => a.id) ?? []
  );
  const [relatedPosts, setRelatedPosts] = useState<RelatedPostItem[]>(
    initial?.relatedPosts ?? []
  );
  const [publishType, setPublishType] = useState<'draft' | 'publish_now' | 'scheduled'>(
    initial?.publishType ?? 'draft'
  );
  const [scheduledPublishAt, setScheduledPublishAt] = useState(
    initial?.scheduledPublishAt ? toLocalDatetimeString(initial.scheduledPublishAt) : ''
  );
  const [availableAuthors, setAvailableAuthors] = useState<AuthorPickerAuthor[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredImageCleared, setFeaturedImageCleared] = useState(false);
  const featuredFileInputRef = useRef<HTMLInputElement>(null);
  const [ogFile, setOgFile] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    initial?.galleryImages ?? []
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [savingTarget, setSavingTarget] = useState<'draft' | 'primary' | null>(null);
  const savingRef = useRef(false);
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
    if (featuredImageCleared) return null;
    if (featuredFile) return URL.createObjectURL(featuredFile);
    return initial?.featuredImageUrl ?? null;
  }, [featuredFile, featuredImageCleared, initial?.featuredImageUrl]);

  const clearFeaturedImage = () => {
    setFeaturedFile(null);
    setFeaturedImageCleared(true);
    if (featuredFileInputRef.current) {
      featuredFileInputRef.current.value = '';
    }
  };

  const buildDraftSnapshot = useCallback((): BlogDraftSnapshot => ({
    heading,
    shortDescription,
    body,
    categoryId,
    tagNames,
    authorName,
    metaTitle,
    metaDescription,
    canonicalUrl,
    authorIds,
    relatedPosts,
    galleryImages,
    publishType,
    scheduledPublishAt,
    featuredFile,
    ogFile,
  }), [
    heading,
    shortDescription,
    body,
    categoryId,
    tagNames,
    authorName,
    metaTitle,
    metaDescription,
    canonicalUrl,
    authorIds,
    relatedPosts,
    galleryImages,
    publishType,
    scheduledPublishAt,
    featuredFile,
    ogFile,
  ]);

  const flushDraft = useCallback(() => {
    if (!pathname) return Promise.resolve();
    return writeBlogDraft(blogId, pathname, buildDraftSnapshot());
  }, [blogId, pathname, buildDraftSnapshot]);

  const snapshotRef = useRef(buildDraftSnapshot);
  snapshotRef.current = buildDraftSnapshot;

  useEffect(() => {
    let cancelled = false;

    async function restoreDraft() {
      const draft = readBlogDraft(blogId);
      if (draft && draft.path === pathname) {
        const applied = await applyBlogDraft(draft);
        if (cancelled) return;
        setHeading(applied.fields.heading);
        setShortDescription(applied.fields.shortDescription);
        setBody(applied.fields.body);
        setCategoryId(applied.fields.categoryId);
        setTagNames(applied.fields.tagNames);
        setAuthorName(applied.fields.authorName);
        setMetaTitle(applied.fields.metaTitle);
        setMetaDescription(applied.fields.metaDescription);
        setCanonicalUrl(applied.fields.canonicalUrl);
        setAuthorIds(applied.fields.authorIds);
        setRelatedPosts(applied.fields.relatedPosts);
        setGalleryImages(applied.fields.galleryImages);
        setPublishType(applied.fields.publishType);
        setScheduledPublishAt(applied.fields.scheduledPublishAt);
        if (applied.featuredFile) setFeaturedFile(applied.featuredFile);
        if (applied.ogFile) setOgFile(applied.ogFile);
        toast.success('Draft restored');
      }

      const params = new URLSearchParams(window.location.search);
      const newAuthorId = params.get('newAuthorId');
      if (newAuthorId) {
        const id = Number(newAuthorId);
        if (!Number.isNaN(id)) {
          setAuthorIds((prev) =>
            prev.includes(id) ? prev : [...prev, id]
          );
        }
        params.delete('newAuthorId');
        const query = params.toString();
        const cleanPath = query
          ? `${window.location.pathname}?${query}`
          : window.location.pathname;
        window.history.replaceState(null, '', cleanPath);
      }

      if (!cancelled) setDraftReady(true);
    }

    restoreDraft();
    return () => {
      cancelled = true;
    };
  }, [blogId, pathname]);

  useEffect(() => {
    if (!draftReady || !pathname) return;
    const timer = window.setTimeout(() => {
      writeBlogDraft(blogId, pathname, buildDraftSnapshot());
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draftReady, blogId, pathname, buildDraftSnapshot]);

  useEffect(() => {
    if (!draftReady || initial?.authorName) return;
    const draft = readBlogDraft(blogId);
    if (draft?.path === pathname) return;
    if (admin?.name && !authorName.trim()) {
      setAuthorName(admin.name);
    }
  }, [draftReady, admin, initial?.authorName, blogId, pathname, authorName]);

  useEffect(() => {
    if (!draftReady || baselineRef.current) return;

    const timer = window.setTimeout(() => {
      if (!baselineRef.current) {
        baselineRef.current = cloneBlogSnapshot(snapshotRef.current());
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [draftReady]);

  const applySnapshot = useCallback((snapshot: BlogDraftSnapshot) => {
    setHeading(snapshot.heading);
    setShortDescription(snapshot.shortDescription);
    setBody(snapshot.body);
    setCategoryId(snapshot.categoryId);
    setTagNames(snapshot.tagNames);
    setAuthorName(snapshot.authorName);
    setMetaTitle(snapshot.metaTitle);
    setMetaDescription(snapshot.metaDescription);
    setCanonicalUrl(snapshot.canonicalUrl);
    setAuthorIds([...snapshot.authorIds]);
    setRelatedPosts(snapshot.relatedPosts.map((post) => ({ ...post, category: { ...post.category } })));
    setGalleryImages(snapshot.galleryImages.map((img) => ({ ...img })));
    setPublishType(snapshot.publishType);
    setScheduledPublishAt(snapshot.scheduledPublishAt);
    setFeaturedFile(snapshot.featuredFile ?? null);
    setOgFile(snapshot.ogFile ?? null);
  }, []);

  const isDirty = useCallback(() => {
    if (!draftReady) return false;
    const current = buildDraftSnapshot();
    if (!baselineRef.current) {
      return Boolean(
        current.heading.trim() ||
          current.shortDescription.trim() ||
          current.body.trim() ||
          current.tagNames.trim() ||
          current.metaTitle.trim() ||
          current.metaDescription.trim() ||
          current.canonicalUrl.trim() ||
          current.authorIds.length > 0 ||
          current.galleryImages.length > 0 ||
          current.publishType !== 'draft' ||
          current.scheduledPublishAt !== '' ||
          current.featuredFile ||
          current.ogFile
      );
    }
    return !blogSnapshotsEqual(current, baselineRef.current);
  }, [draftReady, buildDraftSnapshot]);

  const resetToBaseline = useCallback(() => {
    if (!baselineRef.current) return;
    applySnapshot(baselineRef.current);
    clearBlogDraft(blogId);
    if (pathname) {
      writeBlogDraft(blogId, pathname, baselineRef.current);
    }
    toast.success('Changes reset');
  }, [applySnapshot, blogId, pathname]);

  const discardChanges = useCallback(() => {
    clearBlogDraft(blogId);
    baselineRef.current = cloneBlogSnapshot(snapshotRef.current());
  }, [blogId]);

  useRegisterNavigationGuard({
    enabled: draftReady,
    isDirty,
    reset: resetToBaseline,
    discard: discardChanges,
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await publicApi.categories.list();
        const data = res as { data: { categories: CategoryOption[] } };
        const loaded = data.data?.categories ?? [];

        if (loaded.length > 0) {
          setCategories(loaded);
          setCategoryId((current) => current || String(loaded[0].id));
          return;
        }
      } catch {
        // Fallback below
      }

      if (initial?.categoryId && initial.categoryName) {
        setCategories([{ id: initial.categoryId, name: initial.categoryName }]);
        setCategoryId((current) => current || String(initial.categoryId));
      }
    }

    loadCategories();
  }, [initial]);

  const loadAuthors = async () => {
    setAuthorsLoading(true);
    try {
      const res = await adminApi.authors.list({ limit: 100 });
      setAvailableAuthors(res.data.authors);
    } catch {
      // Keep existing list on refresh failure
    } finally {
      setAuthorsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadAuthors();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateImageFile = (file: File | null, label: string): boolean => {
    if (!file) return true;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      toast.error(`${label}: Only JPEG, PNG, and WebP images are supported.`);
      return false;
    }
    return true;
  };

  const buildFormData = (publishTypeOverride?: typeof publishType) => {
    const effectivePublishType = publishTypeOverride ?? publishType;
    const formData = new FormData();
    formData.append('heading', heading.trim());
    formData.append('shortDescription', shortDescription.trim());
    formData.append('body', body);
    formData.append('categoryId', categoryId);
    formData.append('authorName', authorName.trim() || 'TEOTIA & CO.');

    if (authorIds.length > 0) {
      formData.append('authorIds', JSON.stringify(authorIds));
    }

    if (relatedPosts.length > 0) {
      formData.append('relatedBlogIds', JSON.stringify(relatedPosts.map((post) => post.id)));
    } else if (isEdit) {
      formData.append('relatedBlogIds', JSON.stringify([]));
    }

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
    formData.append('publishType', effectivePublishType);
    if (effectivePublishType === 'scheduled' && scheduledPublishAt) {
      formData.append('scheduledPublishAt', new Date(scheduledPublishAt).toISOString());
    }
    if (featuredImageCleared && isEdit) {
      formData.append('removeFeaturedImage', 'true');
    }
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

  const saveSuccessMessage = (
    effectivePublishType: typeof publishType,
    editing: boolean,
  ) => {
    if (effectivePublishType === 'publish_now') return 'Blog published';
    if (effectivePublishType === 'scheduled') return 'Blog scheduled';
    return editing ? 'Blog updated' : 'Blog saved as draft';
  };

  const save = async (
    publishTypeOverride: typeof publishType,
    target: 'draft' | 'primary',
  ) => {
    if (savingRef.current) return;

    const effectivePublishType = publishTypeOverride;

    if (!heading.trim() || !shortDescription.trim() || !body.trim()) {
      toast.error('Heading, description, and body are required');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (categories.length === 0) {
      toast.error('No categories available. Run backend migrations and restart the API.');
      return;
    }
    
    if (effectivePublishType === 'scheduled') {
      const scheduleError = validateScheduledPublishAt(scheduledPublishAt);
      if (scheduleError) {
        toast.error(scheduleError);
        return;
      }
    }

    if (!validateImageFile(featuredFile, 'Featured image')) return;
    if (!validateImageFile(ogFile, 'OG image')) return;

    savingRef.current = true;
    setSavingTarget(target);
    try {
      const formData = buildFormData(publishTypeOverride);

      if (isEdit && blogId) {
        await adminApi.blogs.update(blogId, formData);
      } else {
        await adminApi.blogs.create(formData);
      }

      toast.success(saveSuccessMessage(effectivePublishType, isEdit));

      clearBlogDraft(blogId);
      router.push('/admin/blogs');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save blog');
    } finally {
      savingRef.current = false;
      setSavingTarget(null);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleFormSubmit} className="admin-form" noValidate>
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
            Categories are loaded from the blog category list. Run database
            migrations if this dropdown is empty.
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
          <label htmlFor="authorName">Fallback Author name (legacy)</label>
          <input
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>

        <div className="admin-field">
          <AuthorPicker
            authors={availableAuthors}
            selectedIds={authorIds}
            onChange={setAuthorIds}
            onRefresh={loadAuthors}
            onBeforeNavigate={flushDraft}
            loading={authorsLoading}
          />
        </div>

        <div className="admin-field">
          <RelatedPostsField
            blogId={blogId}
            selected={relatedPosts}
            onChange={setRelatedPosts}
          />
        </div>

        <div className="admin-field">
          <label>Publishing Options</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="publishType" 
                value="draft" 
                checked={publishType === 'draft'} 
                onChange={(e) => setPublishType(e.target.value as any)} 
              />
              Save as Draft
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="publishType" 
                value="publish_now" 
                checked={publishType === 'publish_now'} 
                onChange={(e) => setPublishType(e.target.value as any)} 
              />
              Publish Immediately
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="publishType" 
                value="scheduled" 
                checked={publishType === 'scheduled'} 
                onChange={(e) => setPublishType(e.target.value as any)} 
              />
              Schedule for Later
            </label>
          </div>

          {publishType === 'scheduled' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="scheduledPublishAt">Publish Date & Time (Local)</label>
              <input
                id="scheduledPublishAt"
                type="datetime-local"
                value={scheduledPublishAt}
                onChange={(e) => setScheduledPublishAt(e.target.value)}
                min={toLocalDatetimeString(new Date())}
                required={publishType === 'scheduled'}
              />
            </div>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="featuredImage">Featured image</label>
          <input
            id="featuredImage"
            ref={featuredFileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setFeaturedFile(file);
              if (file) setFeaturedImageCleared(false);
            }}
          />
          {featuredPreviewUrl && (
            <div className="admin-featured-preview-wrap">
              <img
                src={featuredPreviewUrl}
                alt="Featured preview"
                className="admin-image-preview"
              />
              <button
                type="button"
                className="admin-gallery-remove"
                onClick={clearFeaturedImage}
                aria-label="Remove featured image"
              >
                ×
              </button>
            </div>
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
            accept="image/jpeg,image/jpg,image/png,image/webp"
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
          type="button"
          className="admin-btn admin-btn-secondary"
          disabled={savingTarget !== null}
          onClick={() => save('draft', 'draft')}
        >
          {savingTarget === 'draft' ? 'Saving…' : isEdit ? 'Save changes' : 'Save draft'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          disabled={savingTarget !== null}
          onClick={() => save(publishType, 'primary')}
        >
          {savingTarget === 'primary'
            ? 'Saving…'
            : publishType === 'publish_now'
              ? 'Save & Publish'
              : publishType === 'scheduled'
                ? 'Save & Schedule'
                : 'Save changes'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          disabled={savingTarget !== null}
          onClick={() => {
            clearBlogDraft(blogId);
            navigateWithoutGuard('/admin/blogs');
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
