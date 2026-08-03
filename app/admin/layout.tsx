'use client';

import { usePathname } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminNavigationGuardProvider } from '@/lib/hooks/AdminNavigationGuard';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <div className="admin-root">{children}</div>;
  }

  return (
    <AdminAuthGuard>
      <AdminNavigationGuardProvider>
        <AdminShell>{children}</AdminShell>
      </AdminNavigationGuardProvider>
    </AdminAuthGuard>
  );
}
