'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AuthorForm } from '@/components/admin/AuthorForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPanelSkeleton } from '@/components/admin/AdminSkeleton';
import { adminApi } from '@/lib/api/client';
import { ApiAuthorDetail } from '@/lib/api/types';

export default function EditAuthorPage() {
  const params = useParams();
  const id = Number(params.id);
  const [author, setAuthor] = useState<ApiAuthorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError('Invalid author ID');
      setLoading(false);
      return;
    }

    async function loadAuthor() {
      try {
        const res = await adminApi.authors.getById(id);
        const data = res as unknown as { data: { author: ApiAuthorDetail } };
        setAuthor(data.data.author);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load author');
      } finally {
        setLoading(false);
      }
    }

    loadAuthor();
  }, [id]);

  return (
    <>
      <AdminPageHeader
        title={author ? author.name : 'Edit author'}
        description={
          author
            ? 'Update profile photo, bio, and social links'
            : 'Update author profile'
        }
      />
      <div className="admin-content admin-content-centered">
        {loading && <AdminPanelSkeleton />}
        {error && <div className="admin-error">{error}</div>}
        {!loading && !error && author && (
          <AuthorForm initialData={author} />
        )}
      </div>
    </>
  );
}
