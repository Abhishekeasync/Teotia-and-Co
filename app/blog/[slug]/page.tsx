import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense, cache } from 'react';
import '../../page-styles.css';
import { BlogAuthorByline } from '@/components/blog/BlogAuthorByline';
import { BlogComments } from '@/components/blog/BlogComments';
import { BlogHeroCarousel } from '@/components/blog/BlogHeroCarousel';
import { BlogPostShare, BlogShareBar } from '@/components/blog/BlogPostShare';
import { BlogRecentPostsSection } from '@/components/blog/BlogRecentPostsSection';
import { BlogRelatedPosts } from '@/components/blog/BlogRelatedPosts';
import { BlogTagList } from '@/components/blog/BlogTagList';
import { publicApi } from '@/lib/api/client';
import { mapApiBlogToPost, mapRelatedPostsToBlogPosts } from '@/lib/api/mappers';
import { ApiBlogDetailResponse } from '@/lib/api/types';
import { normalizeApiBlog } from '@/lib/api/normalize';
import { buildFallbackShareLinks } from '@/lib/api/shareLinks';
import { sanitizeHtml } from '@/lib/utils/sanitize';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const getBlogBySlug = cache(async (slug: string) => {
  try {
    const response = await publicApi.blogs.getBySlug(slug);
    const data = response as { data: ApiBlogDetailResponse };
    const raw = data.data?.blog;
    return raw ? normalizeApiBlog(raw) : null;
  } catch (error) {
    console.error('Failed to fetch blog:', error);
    return null;
  }
});

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: 'Post Not Found' };

  return {
    title: `${blog.heading} | TEOTIA & CO.`,
    description: blog.metaDescription || blog.shortDescription,
    openGraph: {
      title: blog.metaTitle || blog.heading,
      description: blog.metaDescription || blog.shortDescription,
      images: blog.ogImageUrl || blog.featuredImageUrl || undefined,
      type: 'article',
      publishedTime: blog.publishedAt || undefined,
      authors:
        blog.authors && blog.authors.length > 0
          ? blog.authors.map((a) => a.name)
          : [blog.authorName],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) notFound();

  const post = mapApiBlogToPost(blog);
  const relatedPosts = mapRelatedPostsToBlogPosts(blog.relatedPosts ?? []);
  const hasRelatedPosts = relatedPosts.length > 0;
  const shareLinks = buildFallbackShareLinks(slug, blog.heading);
  const sanitizedBody = sanitizeHtml(blog.body);

  return (
    <>
      <div
        className={`blog-post-layout${hasRelatedPosts ? '' : ' blog-post-layout--centered'}`}
      >
        <article className="blog-post-page">
          <div className="blog-post-inner">
            <Link href="/blog" className="blog-all-posts">
              ← All Posts
            </Link>

            <h1 className="blog-post-title">{blog.heading}</h1>

            {blog.categoryName && (
              <div className="blog-category-badge" style={{ marginBottom: '1rem' }}>
                {blog.categoryName}
              </div>
            )}

            <div
              className="blog-author-row blog-post-author-row"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2rem',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <BlogAuthorByline
                  author={post.author}
                  authorAvatar={post.authorAvatar}
                  authors={post.authors}
                  avatarSize={48}
                  nameClassName="blog-author-name hover:text-brand transition-colors"
                  showDesignation={(post.authors?.length ?? 0) === 1}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.5rem',
                }}
              >
                <div className="blog-author-meta" style={{ fontSize: '0.9rem', color: '#666' }}>
                  {post.date} · {post.readTime}
                </div>
                <BlogPostShare heading={blog.heading} links={shareLinks} />
              </div>
            </div>

            {(blog.featuredImageUrl || (blog.galleryImages?.length ?? 0) > 0) && (
              <BlogHeroCarousel
                featuredImageUrl={blog.featuredImageUrl}
                galleryImages={blog.galleryImages ?? []}
                title={blog.heading}
              />
            )}

            <div
              className="blog-post-content"
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />

            <div className="blog-post-meta-footer">
              {blog.tags.length > 0 ? (
                <div className="blog-post-tags">
                  <strong className="blog-post-tags-label">Tags</strong>
                  <BlogTagList tags={blog.tags} />
                </div>
              ) : (
                <div />
              )}

              <BlogShareBar heading={blog.heading} links={shareLinks} />
            </div>

            <BlogComments slug={slug} />

            {hasRelatedPosts && (
              <div className="blog-related-posts-mobile">
                <BlogRelatedPosts posts={relatedPosts} />
              </div>
            )}
          </div>
        </article>

        {hasRelatedPosts && (
          <div className="blog-post-sidebar">
            <BlogRelatedPosts posts={relatedPosts} />
          </div>
        )}
      </div>

      {!hasRelatedPosts && (
        <Suspense fallback={null}>
          <BlogRecentPostsSection slug={slug} />
        </Suspense>
      )}
    </>
  );
}
