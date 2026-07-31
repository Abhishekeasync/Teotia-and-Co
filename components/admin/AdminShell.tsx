'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/blogs', label: 'Blogs' },
  { href: '/admin/comments', label: 'Comments' },
  { href: '/admin/subscribers', label: 'Subscribers' },
  { href: '/admin/enquiries', label: 'Enquiries' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="admin-root admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          TEOTIA & CO.
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href, item.exact) ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          {admin?.name && <div>Signed in as {admin.name}</div>}
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
