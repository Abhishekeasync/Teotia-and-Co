'use client';

import Image from 'next/image';
import '@/app/page-styles.css';
import { BlogHeroCarousel, BlogGalleryImage } from '@/components/blog/BlogHeroCarousel';
import { BlogPostShare, BlogShareBar } from '@/components/blog/BlogPostShare';
import { BlogTagList } from '@/components/blog/BlogTagList';
import { mapApiBlogToPost } from '@/lib/api/mappers';
import { buildFallbackShareLinks } from '@/lib/api/shareLinks';
import { sanitizeHtml } from '@/lib/utils/sanitize';

type BlogPreviewProps = {
  heading: string;
  shortDescription: string;
  body: string;
  tags: string[];
  authorName: string;
  categoryName?: string;
  featuredImageUrl?: string | null;
  galleryImages?: BlogGalleryImage[];
};

const AUTHOR_AVATAR =
  '/assets/images/static.wixstatic.com/d8ab7d3a-12ec-4da4-96ad-a9761e57c1f0_edited-4fa8dd2ff7.png';

export function BlogPreview({
  heading,
  shortDescription,
  body,
  tags,
  authorName,
  categoryName,
  featuredImageUrl,
  galleryImages = [],
}: BlogPreviewProps) {
  const headingDisplay = heading.trim() || 'Untitled post';
  const authorDisplay = authorName.trim() || 'TEOTIA & CO.';

  const post = mapApiBlogToPost({
    id: 0,
    heading: headingDisplay,
    slug: 'preview',
    shortDescription,
    body,
    featuredImageUrl: featuredImageUrl ?? null,
    metaTitle: null,
    metaDescription: null,
    canonicalUrl: null,
    ogImageUrl: null,
    status: 'draft',
    publishedAt: new Date().toISOString(),
    categoryId: 0,
    categoryName: categoryName ?? 'Uncategorized',
    categorySlug: 'uncategorized',
    tags,
    authorName: authorDisplay,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    galleryImages: galleryImages.map((image, index) => ({
      id: image.id ?? index,
      imageUrl: image.imageUrl,
      displayOrder: image.displayOrder ?? index,
    })),
  });

  const shareLinks = buildFallbackShareLinks('preview', headingDisplay);
  const hasImages =
    Boolean(featuredImageUrl?.trim()) || galleryImages.some((image) => image.imageUrl?.trim());

  return (
    <article className="blog-post-page admin-blog-preview-page">
      <div className="blog-post-inner">
        <span className="blog-all-posts" aria-hidden>
          ← All Posts
        </span>

        <h1 className="blog-post-title">{headingDisplay}</h1>

        {categoryName && (
          <div className="blog-category-badge" style={{ marginBottom: '1rem' }}>
            {categoryName}
          </div>
        )}

        <div className="blog-author-row blog-post-author-row">
          <div className="blog-author-info">
            <Image
              src={AUTHOR_AVATAR}
              alt={authorDisplay}
              width={40}
              height={40}
              className="blog-author-avatar"
            />
            <div>
              <div className="blog-author-name">{authorDisplay}</div>
              <div className="blog-author-meta">
                {post.date} · {post.readTime}
              </div>
            </div>
          </div>
          <BlogPostShare heading={headingDisplay} links={shareLinks} />
        </div>

        {hasImages && (
          <BlogHeroCarousel
            featuredImageUrl={featuredImageUrl}
            galleryImages={galleryImages}
            title={headingDisplay}
          />
        )}

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(body || '<p></p>'),
          }}
        />

        <div className="blog-post-meta-footer">
          {tags.length > 0 ? (
            <div className="blog-post-tags">
              <strong className="blog-post-tags-label">Tags</strong>
              <BlogTagList tags={tags} />
            </div>
          ) : (
            <div />
          )}

          <BlogShareBar heading={headingDisplay} links={shareLinks} />
        </div>
      </div>
    </article>
  );
}
