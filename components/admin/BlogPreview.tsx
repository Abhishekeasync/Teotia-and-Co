'use client';

import { sanitizeHtml } from '@/lib/utils/sanitize';
import { BlogGalleryImage, BlogHeroCarousel } from '@/components/blog/BlogHeroCarousel';
import { BlogTagList } from '@/components/blog/BlogTagList';

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
  return (
    <div className="admin-blog-preview">
      <p className="admin-field-hint admin-blog-preview-label">Live preview</p>
      <article className="admin-blog-preview-article">
        {categoryName && (
          <span className="admin-blog-preview-category">{categoryName}</span>
        )}
        <h3>{heading || 'Untitled post'}</h3>
        <p className="admin-blog-preview-meta">
          By {authorName || 'TEOTIA & CO.'}
        </p>
        {shortDescription && (
          <p className="admin-blog-preview-excerpt">{shortDescription}</p>
        )}
        {(featuredImageUrl || galleryImages.length > 0) && (
          <BlogHeroCarousel
            featuredImageUrl={featuredImageUrl}
            galleryImages={galleryImages}
            title={heading || 'Blog preview'}
          />
        )}
        {tags.length > 0 && <BlogTagList tags={tags} />}
        <div
          className="blog-post-content admin-blog-preview-content"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(body || '<p></p>'),
          }}
        />
      </article>
    </div>
  );
}
