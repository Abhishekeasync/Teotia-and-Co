import './blog-editorial.css';
import { BlogPost } from '@/lib/blog-posts';
import { BlogGrid } from './BlogGrid';
import { BlogEmptyState } from './BlogEmptyState';
import { BlogTagFilter } from './BlogTagFilter';

type BlogSectionProps = {
  posts: BlogPost[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  infiniteScroll?: boolean;
  activeTag?: string;
};

export function BlogSection({
  posts,
  title = 'Insights & Articles',
  subtitle = 'Expert insights and practical guidance to help you make informed financial decisions.',
  showHeader = true,
  infiniteScroll = true,
  activeTag,
}: BlogSectionProps) {
  return (
    <section className="section section-gray blog-insights-section" aria-labelledby={showHeader ? 'blog-insights-heading' : undefined}>
      <div className="blog-insights-inner">
        {activeTag && <BlogTagFilter tag={activeTag} />}

        {showHeader && (
          <header className="blog-insights-header">
            <p className="blog-insights-eyebrow">Blog</p>
            <h2 id="blog-insights-heading" className="blog-insights-title">
              {title}
            </h2>
            <p className="blog-insights-subtitle">{subtitle}</p>
          </header>
        )}

        {posts.length === 0 ? (
          <BlogEmptyState
            title={activeTag ? `No posts for #${activeTag}` : undefined}
            message={
              activeTag
                ? 'Try another tag or view all blog posts.'
                : undefined
            }
            showClearFilter={Boolean(activeTag)}
          />
        ) : (
          <BlogGrid posts={posts} infiniteScroll={infiniteScroll} />
        )}
      </div>
    </section>
  );
}
