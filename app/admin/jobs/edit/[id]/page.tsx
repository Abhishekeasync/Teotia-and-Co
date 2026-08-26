'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobForm } from '@/components/admin/JobForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { adminApi } from '@/lib/api/client';
import { ApiJob } from '@/lib/api/types';
import { toast } from '@/lib/toast';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<ApiJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const id = Number(params.id);
        if (isNaN(id)) throw new Error('Invalid Job ID');

        const res = await adminApi.jobs.getById(id);
        const data = res as { data: ApiJob };
        setJob(data.data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load job');
        router.push('/admin/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="admin-content">
        <p>Loading...</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <>
      <AdminPageHeader title="Edit Job" description="Update an existing job posting" />
      <div className="admin-content admin-content-centered">
        <JobForm initialData={job} />
      </div>
    </>
  );
}
