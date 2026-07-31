'use client';

import { BlogForm } from '@/components/admin/BlogForm';

export default function NewBlogPage() {
  return (
    <>
      <header className="admin-header">
        <h2>New blog post</h2>
      </header>
      <div className="admin-content admin-content-centered">
        <BlogForm />
      </div>
    </>
  );
}
