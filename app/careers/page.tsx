import type { Metadata } from 'next';
import { publicApi } from '@/lib/api/client';
import { ApiJob, ApiJobListResponse } from '@/lib/api/types';
import { generatePageMetadata } from '@/lib/metadata';
import '../page-styles.css';
import './careers.css';
import { CareersClientPage } from './CareersClientPage';

export const metadata: Metadata = generatePageMetadata({
  title: 'Careers at TEOTIA & CO. , Join Our CA Team in Noida',
  description:
    'Explore career opportunities at TEOTIA & CO., a leading chartered accountancy firm in Noida. Join our team of taxation, audit, and business advisory professionals.',
  path: '/careers',
  keywords: [
    'CA jobs Noida',
    'chartered accountant careers',
    'audit jobs Delhi NCR',
    'tax consultant jobs',
    'accounting jobs Noida',
    'TEOTIA & CO careers',
    'finance jobs India',
  ],
});

export const revalidate = 60;

async function getJobs(): Promise<{ jobs: ApiJob[]; meta: any }> {
  try {
    const res = await publicApi.jobs.list({ page: 1, limit: 50 });
    const data = res as { data: ApiJobListResponse };
    return data.data;
  } catch {
    return { jobs: [], meta: { total: 0, totalPages: 0, page: 1, limit: 50 } };
  }
}

export default async function CareersPage() {
  const { jobs } = await getJobs();
  return <CareersClientPage jobs={jobs} />;
}
