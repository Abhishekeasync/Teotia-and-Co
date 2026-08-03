'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthorForm } from '@/components/admin/AuthorForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

function NewAuthorContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return (
    <>
      <AdminPageHeader
        title="New author"
        description={
          returnTo
            ? 'Create an author, then return to your blog post'
            : 'Create a profile for blog bylines and author pages'
        }
      />
      <div className="admin-content admin-content-centered">
        <AuthorForm returnTo={returnTo} />
      </div>
    </>
  );
}

export default function NewAuthorPage() {
  return (
    <Suspense>
      <NewAuthorContent />
    </Suspense>
  );
}
