'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-posts';
import { BlogPostMeta } from './BlogPostMeta';
import { CategoryBadge } from './CategoryBadge';

type RelatedPostSidebarCardProps = {
  post: BlogPost;
};

export function RelatedPostSidebarCard({ post }: RelatedPostSidebarCardProps) {
  return (
    <article className="blog-related-card">
      <Link href={`/blog/${post.slug}`} className="blog-related-card-link">
        <div className="blog-related-card-media">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 280px"
            className="blog-related-card-image"
          />
          <div className="blog-related-card-badge">
            <CategoryBadge category={post.category} />
          </div>
        </div>
        <div className="blog-related-card-body">
          <h3 className="blog-related-card-title">{post.title}</h3>
          <p className="blog-related-card-excerpt">{post.excerpt}</p>
          <BlogPostMeta
            author={post.author}
            authorAvatar={post.authorAvatar}
            authors={post.authors}
            date={post.date}
            readTime={post.readTime}
            variant="timestamps"
          />
        </div>
      </Link>
    </article>
  );
}

type BlogRelatedPostsProps = {
  posts: BlogPost[];
  className?: string;
};

export function BlogRelatedPosts({ posts, className = '' }: BlogRelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <aside className={`blog-related-posts ${className}`.trim()} aria-label="Related posts">
      <h2 className="blog-related-posts-title">Related Posts</h2>
      <div className="blog-related-posts-list">
        {posts.map((post) => (
          <RelatedPostSidebarCard key={post.slug} post={post} />
        ))}
      </div>
    </aside>
  );
}
