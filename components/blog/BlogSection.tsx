import './blog-editorial.css';
import { BlogPost } from '@/lib/blog-posts';
import { BlogGrid } from './BlogGrid';
import { BlogEmptyState } from './BlogEmptyState';
import { BlogAuthorFilter } from './BlogAuthorFilter';
import { BlogTagFilter } from './BlogTagFilter';

type BlogSectionProps = {
  posts: BlogPost[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  infiniteScroll?: boolean;
  activeTag?: string;
  activeAuthorName?: string;
};

export function BlogSection({
  posts,
  title = 'Insights & Articles',
  subtitle = 'Expert insights and practical guidance to help you make informed financial decisions.',
  showHeader = true,
  infiniteScroll = true,
  activeTag,
  activeAuthorName,
}: BlogSectionProps) {
  const hasActiveFilter = Boolean(activeTag || activeAuthorName);

  return (
    <section className="section section-gray blog-insights-section" aria-labelledby={showHeader ? 'blog-insights-heading' : undefined}>
      <div className="blog-insights-inner">
        {activeTag && <BlogTagFilter tag={activeTag} />}
        {activeAuthorName && <BlogAuthorFilter authorName={activeAuthorName} />}

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
            title={
              activeTag
                ? `No posts for #${activeTag}`
                : activeAuthorName
                  ? `No posts by ${activeAuthorName}`
                  : undefined
            }
            message={
              hasActiveFilter
                ? 'Try another filter or view all blog posts.'
                : undefined
            }
            showClearFilter={hasActiveFilter}
          />
        ) : (
          <BlogGrid posts={posts} infiniteScroll={infiniteScroll} />
        )}
      </div>
    </section>
  );
}
