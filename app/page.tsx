import { SchemaOrg, organizationSchema } from '@/components/SchemaOrg';
import { HeroSection } from '@/components/home/HeroSection';
import { HomePageClient } from '@/components/home/HomePageClient';
import { publicApi } from '@/lib/api/client';
import { mapApiBlogsToPost } from '@/lib/api/mappers';
import { normalizeApiBlogs } from '@/lib/api/normalize';

async function getLatestBlogPosts() {
  try {
    const response = await publicApi.blogs.list({
      page: 1,
      limit: 3,
      sort: 'latest',
    });
    const data = response as { data?: { blogs?: unknown[] } };
    const blogs = normalizeApiBlogs(
      (data.data?.blogs ?? []) as Parameters<typeof normalizeApiBlogs>[0],
    );
    return mapApiBlogsToPost(blogs);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

export default async function Home() {
  const blogPosts = await getLatestBlogPosts();

  return (
    <>
      <SchemaOrg schema={organizationSchema} />
      <HeroSection />
      <HomePageClient blogPosts={blogPosts} />
    </>
  );
}
