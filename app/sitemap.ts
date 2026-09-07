import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.teotiaco.com';

// Static service slugs — sourced from lib/services.ts
const SERVICE_SLUGS = [
  'company-incorporation',
  'corporate-secretarial',
  'fdi-fema-advisory',
  'regulatory-approvals',
  'ma-transaction-advisory',
  'contracts-agreements',
  'startup-msme-advisory',
  'ipr-protection',
  'taxation-accounting',
  'corporate-restructuring',
];

// Fetch dynamic blog slugs from API
async function getBlogSlugs(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
    const res = await fetch(
      `${backendUrl}/api/v1/blogs?limit=1000&fields=slug,updatedAt`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.blogs ?? [];
  } catch {
    return [];
  }
}

// Fetch dynamic job slugs from API
async function getJobSlugs(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
    const res = await fetch(
      `${backendUrl}/api/v1/jobs?limit=500&fields=slug,updatedAt`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.jobs ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, jobListings] = await Promise.all([
    getBlogSlugs(),
    getJobSlugs(),
  ]);

  // ── Static pages ──────────────────────────────────────────
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
      lastModified: '2026-09-04',
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
      lastModified: '2026-08-20',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: '2026-08-20',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ── Service detail pages ──────────────────────────────────
  const servicePages: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: '2026-09-04',
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // ── Dynamic blog posts ────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt
      ? new Date(post.updatedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // ── Dynamic job listings ──────────────────────────────────
  const jobPages: MetadataRoute.Sitemap = jobListings.map((job) => ({
    url: `${BASE_URL}/careers/${job.slug}`,
    lastModified: job.updatedAt
      ? new Date(job.updatedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...servicePages, ...blogPages, ...jobPages];
}
