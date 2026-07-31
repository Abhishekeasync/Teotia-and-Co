'use client';

import { BlogForm } from '@/components/admin/BlogForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function NewBlogPage() {
  return (
    <>
      <AdminPageHeader title="New blog post" description="Draft and publish a new article" />
      <div className="admin-content admin-content-centered">
        <BlogForm />
      </div>
    </>
  );
}
