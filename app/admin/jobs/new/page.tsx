'use client';

import { JobForm } from '@/components/admin/JobForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function NewJobPage() {
  return (
    <>
      <AdminPageHeader title="New Job" description="Create a new job posting" />
      <div className="admin-content admin-content-centered">
        <JobForm />
      </div>
    </>
  );
}
