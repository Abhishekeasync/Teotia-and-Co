import { MetadataRoute } from 'next';
import { LEGAL_LAST_UPDATED } from '@/lib/legal';
import { getAllServiceSlugs } from '@/lib/services';

const BASE_URL = 'https://www.teotiaco.com';

type SitemapSlugEntry = {
  slug: string;
  updatedAt?: string;
  status?: string;
};

function getBackendUrl(): string {
  return process.env.BACKEND_URL || 'http://127.0.0.1:5000';
}

function isPublishedEntry(entry: SitemapSlugEntry): boolean {
  if (!entry.slug?.trim()) return false;
  if (!entry.status) return true;
  return entry.status === 'published';
}

function toLastModified(updatedAt?: string): string {
  if (!updatedAt) {
    return new Date().toISOString().split('T')[0];
  }
  return new Date(updatedAt).toISOString().split('T')[0];
}

async function getBlogSlugs(): Promise<SitemapSlugEntry[]> {
  try {
    const res = await fetch(
      `${getBackendUrl()}/api/v1/blogs?limit=1000&fields=slug,updatedAt,status`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const blogs: SitemapSlugEntry[] = data?.data?.blogs ?? [];
    return blogs.filter(isPublishedEntry);
  } catch {
    return [];
  }
}

async function getJobSlugs(): Promise<SitemapSlugEntry[]> {
  try {
    const res = await fetch(
      `${getBackendUrl()}/api/v1/jobs?limit=500&fields=slug,updatedAt,status`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: SitemapSlugEntry[] = data?.data?.jobs ?? [];
    return jobs.filter(isPublishedEntry);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, jobListings] = await Promise.all([
    getBlogSlugs(),
    getJobSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: '2026-09-07',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: '2026-09-05',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: '2026-09-08',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/careers`,
      lastModified: '2026-09-04',
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: '2026-09-04',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: LEGAL_LAST_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: LEGAL_LAST_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const servicePages: MetadataRoute.Sitemap = getAllServiceSlugs().map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: '2026-09-08',
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: toLastModified(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const jobPages: MetadataRoute.Sitemap = jobListings.map((job) => ({
    url: `${BASE_URL}/careers/${job.slug}`,
    lastModified: toLastModified(job.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...servicePages, ...blogPages, ...jobPages];
}
