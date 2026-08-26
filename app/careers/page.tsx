import { Metadata } from 'next';
import Link from 'next/link';
import { publicApi } from '@/lib/api/client';
import { ApiJob, ApiJobListResponse } from '@/lib/api/types';
import '../page-styles.css';
import './careers.css';
import { CareersClientPage } from './CareersClientPage';

export const metadata: Metadata = {
  title: 'Careers | TEOTIA & CO.',
  description:
    'Explore career opportunities at TEOTIA & CO. — a leading corporate law and compliance firm. Join our team of dedicated legal professionals.',
};

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
