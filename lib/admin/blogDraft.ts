import type { GalleryImage } from '@/components/admin/BlogGalleryUpload';

const PREFIX = 'teotia-admin-blog-draft';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export type BlogDraftData = {
  path: string;
  heading: string;
  shortDescription: string;
  body: string;
  categoryId: string;
  tagNames: string;
  authorName: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  authorIds: number[];
  galleryImages: GalleryImage[];
  publishType: 'draft' | 'publish_now' | 'scheduled';
  scheduledPublishAt: string;
  featuredImageDataUrl?: string | null;
  ogImageDataUrl?: string | null;
  savedAt: number;
};

export type BlogDraftSnapshot = Omit<BlogDraftData, 'path' | 'savedAt'> & {
  featuredFile?: File | null;
  ogFile?: File | null;
};

function draftKey(blogId?: number) {
  return blogId ? `${PREFIX}-edit-${blogId}` : `${PREFIX}-new`;
}

function fileToDataUrl(file: File): Promise<string | null> {
  if (file.size > MAX_IMAGE_BYTES) return Promise.resolve(null);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  } catch {
    return null;
  }
}

export function readBlogDraft(blogId?: number): BlogDraftData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(draftKey(blogId));
    if (!raw) return null;
    return JSON.parse(raw) as BlogDraftData;
  } catch {
    return null;
  }
}

export async function writeBlogDraft(
  blogId: number | undefined,
  path: string,
  snapshot: BlogDraftSnapshot
): Promise<void> {
  if (typeof window === 'undefined') return;

  const featuredImageDataUrl = snapshot.featuredFile
    ? await fileToDataUrl(snapshot.featuredFile)
    : snapshot.featuredImageDataUrl ?? null;

  const ogImageDataUrl = snapshot.ogFile
    ? await fileToDataUrl(snapshot.ogFile)
    : snapshot.ogImageDataUrl ?? null;

  const draft: BlogDraftData = {
    path,
    heading: snapshot.heading,
    shortDescription: snapshot.shortDescription,
    body: snapshot.body,
    categoryId: snapshot.categoryId,
    tagNames: snapshot.tagNames,
    authorName: snapshot.authorName,
    metaTitle: snapshot.metaTitle,
    metaDescription: snapshot.metaDescription,
    canonicalUrl: snapshot.canonicalUrl,
    authorIds: snapshot.authorIds,
    galleryImages: snapshot.galleryImages,
    publishType: snapshot.publishType,
    scheduledPublishAt: snapshot.scheduledPublishAt,
    featuredImageDataUrl,
    ogImageDataUrl,
    savedAt: Date.now(),
  };

  try {
    sessionStorage.setItem(draftKey(blogId), JSON.stringify(draft));
  } catch {
    // Drop images if quota exceeded
    try {
      sessionStorage.setItem(
        draftKey(blogId),
        JSON.stringify({
          ...draft,
          featuredImageDataUrl: null,
          ogImageDataUrl: null,
        })
      );
    } catch {
      // Ignore — draft is best-effort
    }
  }
}

export function clearBlogDraft(blogId?: number): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(draftKey(blogId));
}

export async function applyBlogDraft(
  draft: BlogDraftData
): Promise<{
  featuredFile: File | null;
  ogFile: File | null;
  fields: Omit<
    BlogDraftSnapshot,
    'featuredFile' | 'ogFile' | 'featuredImageDataUrl' | 'ogImageDataUrl'
  >;
}> {
  let featuredFile: File | null = null;
  let ogFile: File | null = null;

  if (draft.featuredImageDataUrl) {
    featuredFile = await dataUrlToFile(draft.featuredImageDataUrl, 'featured-image');
  }
  if (draft.ogImageDataUrl) {
    ogFile = await dataUrlToFile(draft.ogImageDataUrl, 'og-image');
  }

  return {
    featuredFile,
    ogFile,
    fields: {
      heading: draft.heading,
      shortDescription: draft.shortDescription,
      body: draft.body,
      categoryId: draft.categoryId,
      tagNames: draft.tagNames,
      authorName: draft.authorName,
      metaTitle: draft.metaTitle,
      metaDescription: draft.metaDescription,
      canonicalUrl: draft.canonicalUrl,
      authorIds: draft.authorIds,
      galleryImages: draft.galleryImages,
      publishType: draft.publishType ?? 'draft',
      scheduledPublishAt: draft.scheduledPublishAt ?? '',
    },
  };
}

export function appendQueryParam(path: string, key: string, value: string): string {
  const [base, query = ''] = path.split('?');
  const params = new URLSearchParams(query);
  params.set(key, value);
  const next = params.toString();
  return next ? `${base}?${next}` : base;
}

function fileFingerprint(file: File | null | undefined): string {
  if (!file) return '';
  return `${file.name}:${file.size}:${file.type}`;
}

export function cloneBlogSnapshot(snapshot: BlogDraftSnapshot): BlogDraftSnapshot {
  return {
    ...snapshot,
    authorIds: [...snapshot.authorIds],
    galleryImages: snapshot.galleryImages.map((img) => ({ ...img })),
    featuredFile: snapshot.featuredFile,
    ogFile: snapshot.ogFile,
  };
}

export function blogSnapshotsEqual(a: BlogDraftSnapshot, b: BlogDraftSnapshot): boolean {
  if (
    a.heading !== b.heading ||
    a.shortDescription !== b.shortDescription ||
    a.body !== b.body ||
    a.categoryId !== b.categoryId ||
    a.tagNames !== b.tagNames ||
    a.authorName !== b.authorName ||
    a.metaTitle !== b.metaTitle ||
    a.metaDescription !== b.metaDescription ||
    a.canonicalUrl !== b.canonicalUrl ||
    a.publishType !== b.publishType ||
    a.scheduledPublishAt !== b.scheduledPublishAt
  ) {
    return false;
  }

  if (a.authorIds.length !== b.authorIds.length) return false;
  const sortedA = [...a.authorIds].sort((x, y) => x - y);
  const sortedB = [...b.authorIds].sort((x, y) => x - y);
  if (sortedA.some((id, i) => id !== sortedB[i])) return false;

  if (fileFingerprint(a.featuredFile) !== fileFingerprint(b.featuredFile)) return false;
  if (fileFingerprint(a.ogFile) !== fileFingerprint(b.ogFile)) return false;

  return JSON.stringify(a.galleryImages) === JSON.stringify(b.galleryImages);
}
