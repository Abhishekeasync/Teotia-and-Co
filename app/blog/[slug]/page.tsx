import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../page-styles.css';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogAuthorByline } from '@/components/blog/BlogAuthorByline';
import { Stagger } from '@/components/Reveal';
import { publicApi } from '@/lib/api/client';
import { mapApiBlogToPost, mapApiBlogsToPost } from '@/lib/api/mappers';
import { ApiBlogDetailResponse, ApiBlogListResponse, ApiShareLinksResponse } from '@/lib/api/types';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import { BlogComments } from '@/components/blog/BlogComments';
import { BlogHeroCarousel } from '@/components/blog/BlogHeroCarousel';
import { BlogPostShare, BlogShareBar } from '@/components/blog/BlogPostShare';
import { BlogTagList } from '@/components/blog/BlogTagList';
import { normalizeApiBlog, normalizeApiBlogs } from '@/lib/api/normalize';
import { normalizeShareLinks } from '@/lib/api/shareLinks';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

async function getBlogBySlug(slug: string) {
  try {
    const response = await publicApi.blogs.getBySlug(slug);
    const data = response as { data: ApiBlogDetailResponse };
    const raw = data.data?.blog;
    return raw ? normalizeApiBlog(raw) : null;
  } catch (error) {
    console.error('Failed to fetch blog:', error);
    return null;
  }
}

async function getShareLinks(slug: string, heading: string) {
  try {
    const response = await publicApi.blogs.getShareLinks(slug);
    const data = response as { data: ApiShareLinksResponse };
    return normalizeShareLinks(data.data, slug, heading);
  } catch (error) {
    console.error('Failed to fetch share links:', error);
    return normalizeShareLinks(null, slug, heading);
  }
}

async function getRecentBlogs(currentSlug: string) {
  try {
    const response = await publicApi.blogs.list({
      page: 1,
      limit: 3,
      sort: 'latest',
    });
    const data = response as { data: ApiBlogListResponse };
    const blogs = normalizeApiBlogs((data.data?.blogs ?? []) as Parameters<typeof normalizeApiBlogs>[0]);
    const filtered = blogs.filter((blog) => blog.slug !== currentSlug);
    return mapApiBlogsToPost(filtered.slice(0, 3));
  } catch (error) {
    console.error('Failed to fetch recent blogs:', error);
    return [];
  }
}

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
      authors: blog.authors && blog.authors.length > 0
        ? blog.authors.map(a => a.name)
        : [blog.authorName],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) notFound();

  const post = mapApiBlogToPost(blog);
  const recentPosts = await getRecentBlogs(slug);
  const shareLinks = await getShareLinks(slug, blog.heading);

  return (
    <>
      <article className="blog-post-page">
        <div className="blog-post-inner">
          <Link href="/blog" className="blog-all-posts">
            ← All Posts
          </Link>

          <h1 className="blog-post-title">{blog.heading}</h1>

          {/* Category Badge */}
          {blog.categoryName && (
            <div className="blog-category-badge" style={{ marginBottom: '1rem' }}>
              {blog.categoryName}
            </div>
          )}

          <div className="blog-author-row blog-post-author-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
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

          {/* Render HTML content with sanitization */}
          <div 
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.body) }}
          />

          {/* Tags and Share */}
          <div className="blog-post-meta-footer">
            {blog.tags.length > 0 ? (
              <div className="blog-post-tags">
                <strong className="blog-post-tags-label">Tags</strong>
                <BlogTagList tags={blog.tags} />
              </div>
            ) : <div />}

            <BlogShareBar heading={blog.heading} links={shareLinks} />
          </div>

          {/* Comments Section */}
          <BlogComments slug={slug} />
        </div>
      </article>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="section section-gray blog-recent-section">
          <div className="blog-recent">
            <div className="blog-recent-header">
              <h2>Recent Posts</h2>
              <Link href="/blog" className="blog-see-all">
                See All
              </Link>
            </div>
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {recentPosts.map((recent) => (
                <BlogCard key={recent.slug} post={recent} />
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}
