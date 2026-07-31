'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="admin-loading">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <div className="admin-loading">Redirecting to login…</div>;
  }

  return <>{children}</>;
}
