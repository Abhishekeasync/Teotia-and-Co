import Link from 'next/link';
import { cache } from 'react';
import { BlogCard } from '@/components/blog/BlogCard';
import { Stagger } from '@/components/Reveal';
import { publicApi } from '@/lib/api/client';
import { mapApiBlogsToPost } from '@/lib/api/mappers';
import { ApiBlogListResponse } from '@/lib/api/types';
import { normalizeApiBlogs } from '@/lib/api/normalize';

const getRecentBlogs = cache(async (currentSlug: string) => {
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
});

type BlogRecentPostsSectionProps = {
  slug: string;
};

export async function BlogRecentPostsSection({ slug }: BlogRecentPostsSectionProps) {
  const recentPosts = await getRecentBlogs(slug);

  if (recentPosts.length === 0) return null;

  return (
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
  );
}
