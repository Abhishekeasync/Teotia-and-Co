import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../page-styles.css';
import { blogPosts, getPostBySlug, getRecentPosts } from '@/lib/blog-posts';
import { BlogCard } from '@/components/blog/BlogCard';
import { Stagger } from '@/components/Reveal';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | TEOTIA & CO.`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const recentPosts = getRecentPosts(post.slug);

  return (
    <>
      <article className="blog-post-page">
        <div className="blog-post-inner">
          <Link href="/blog" className="blog-all-posts">
            ← All Posts
          </Link>

          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-author-row blog-post-author-row">
            <div className="blog-author-info">
              <Image
                src={post.authorAvatar}
                alt={post.author}
                width={40}
                height={40}
                className="blog-author-avatar"
              />
              <div>
                <div className="blog-author-name">{post.author}</div>
                <div className="blog-author-meta">
                  {post.date} · {post.readTime}
                </div>
              </div>
            </div>
            <button type="button" className="blog-more-btn" aria-label="More options">
              ⋯
            </button>
          </div>

          <div className="blog-post-cover">
            <Image src={post.image} alt={post.title} width={980} height={552} priority />
          </div>

          <div className="blog-post-content">
            {post.content.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>

          <section className="blog-comments" aria-labelledby="blog-comments-heading">
            <h2 id="blog-comments-heading">Comments</h2>
            <label className="blog-comment-field">
              <span className="sr-only">Write a comment</span>
              <input type="text" placeholder="Write a comment..." disabled />
            </label>
          </section>
        </div>
      </article>

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
    </>
  );
}
