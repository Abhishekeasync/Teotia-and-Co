'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BlogForm } from '@/components/admin/BlogForm';
import { adminApi } from '@/lib/api/client';
import { normalizeApiBlog } from '@/lib/api/normalize';
import { ApiBlogDetailResponse } from '@/lib/api/types';

export default function EditBlogPage() {
  const params = useParams();
  const id = Number(params.id);
  const [blog, setBlog] = useState<ReturnType<typeof normalizeApiBlog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError('Invalid blog ID');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await adminApi.blogs.getById(id);
        const data = res as { data: ApiBlogDetailResponse };
        setBlog(normalizeApiBlog(data.data.blog as Parameters<typeof normalizeApiBlog>[0]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <>
      <header className="admin-header">
        <h2>{blog ? `Edit: ${blog.heading}` : 'Edit blog'}</h2>
      </header>
      <div className="admin-content admin-content-centered">
        {loading && <p>Loading blog…</p>}
        {error && <div className="admin-error">{error}</div>}
        {!loading && !error && blog && (
          <BlogForm blogId={blog.id} initial={blog} />
        )}
      </div>
    </>
  );
}
