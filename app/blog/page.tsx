import Link from 'next/link';
import { HeroReveal } from '@/components/Reveal';
import '../page-styles.css';
import { BlogSection } from '@/components/blog/BlogSection';
import { publicApi } from '@/lib/api/client';
import { normalizeApiBlogs } from '@/lib/api/normalize';
import { mapApiBlogsToPost } from '@/lib/api/mappers';

export const dynamic = 'force-dynamic';

type BlogPageProps = {
  searchParams: Promise<{ tag?: string; author?: string }>;
};

async function getBlogPosts(filters: { tag?: string; author?: string }) {
  try {
    const response = await publicApi.blogs.list({
      page: 1,
      limit: 100,
      sort: 'latest',
      tag: filters.tag,
      author: filters.author,
    });
    const data = response as { data?: { blogs?: unknown[] } };
    const blogs = normalizeApiBlogs((data.data?.blogs ?? []) as Parameters<typeof normalizeApiBlogs>[0]);
    return mapApiBlogsToPost(blogs);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

async function getAuthorDisplayName(authorSlug: string) {
  try {
    const res = await publicApi.authors.getBySlug(authorSlug);
    const data = res as unknown as { data: { author: { name: string } } };
    return data.data.author.name;
  } catch {
    return authorSlug;
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag, author } = await searchParams;
  const [posts, activeAuthorName] = await Promise.all([
    getBlogPosts({ tag, author }),
    author ? getAuthorDisplayName(author) : Promise.resolve(undefined),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <HeroReveal delay={0}>
            <h1 className="blog-hero-title">Financial Insights Blog</h1>
          </HeroReveal>
          <HeroReveal delay={0.08}>
            <p className="about-hero-sub">
              Explore expert insights, practical tips, and up-to-date guidance on accounting, taxation, and financial management to help you make informed decisions and stay financially confident.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.16}>
            <nav className="about-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Blog</span>
            </nav>
          </HeroReveal>
        </div>
      </section>

      {/* BLOG EDITORIAL GRID */}
      <BlogSection
        posts={posts}
        activeTag={tag}
        activeAuthorName={author ? activeAuthorName : undefined}
        title="Financial Insights"
        subtitle="Explore expert perspectives on accounting, taxation, compliance, and strategic financial management for growing businesses."
      />
    </>
  );
}
