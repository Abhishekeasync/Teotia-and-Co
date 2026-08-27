'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidate all public blog-related caches.
 * Uses revalidatePath (route-level) as the primary mechanism — this is guaranteed to work
 * regardless of Next.js cache system version. revalidateTag is kept as a belt-and-suspenders
 * supplement for the Data Cache.
 *
 * Call this after any admin mutation that affects blogs (create, update, delete, publish, unpublish).
 */
export async function revalidateBlogs() {
  // Route-level invalidation: next visitor gets a fresh server render
  revalidatePath('/blog', 'page');
  revalidatePath('/blog/[slug]', 'page');
  // Data cache tag invalidation (belt-and-suspenders for ISR fetch cache)
  // Cast needed because Next.js 16 types changed for the new 'use cache' API,
  // but the old fetch + next.tags path still accepts a single argument at runtime.
  (revalidateTag as (tag: string) => void)('blogs');
  (revalidateTag as (tag: string) => void)('blog-detail');
  (revalidateTag as (tag: string) => void)('blog-categories');
}

/**
 * Revalidate the public cache for a single blog slug.
 */
export async function revalidateBlogSlug(slug: string) {
  revalidatePath(`/blog/${slug}`, 'page');
  revalidatePath('/blog', 'page');
  (revalidateTag as (tag: string) => void)(`blog:${slug}`);
  (revalidateTag as (tag: string) => void)('blogs');
}

/**
 * Revalidate all public job-related caches.
 * Call this after any admin mutation that affects jobs (create, update, delete, status change).
 */
export async function revalidateJobs() {
  revalidatePath('/careers', 'page');
  (revalidateTag as (tag: string) => void)('jobs');
  (revalidateTag as (tag: string) => void)('job-detail');
}

/**
 * Revalidate the public cache for a single job.
 */
export async function revalidateJobSlug(slug: string) {
  revalidatePath('/careers', 'page');
  (revalidateTag as (tag: string) => void)(`job:${slug}`);
  (revalidateTag as (tag: string) => void)('jobs');
}
