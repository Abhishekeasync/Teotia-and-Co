'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAdminNavigationGuard } from '@/lib/hooks/AdminNavigationGuard';
import {
  IconAuthor,
  IconBlog,
  IconComment,
  IconDashboard,
  IconLogout,
  IconMail,
  IconUsers,
} from './AdminIcons';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true, Icon: IconDashboard },
  { href: '/admin/blogs', label: 'Blogs', Icon: IconBlog },
  { href: '/admin/authors', label: 'Authors', Icon: IconAuthor },
  { href: '/admin/comments', label: 'Comments', Icon: IconComment },
  { href: '/admin/subscribers', label: 'Subscribers', Icon: IconUsers },
  { href: '/admin/enquiries', label: 'Enquiries', Icon: IconMail },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const { requestNavigation } = useAdminNavigationGuard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const isSameNavTarget = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href;
  };

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    exact?: boolean
  ) => {
    if (isSameNavTarget(href, exact)) {
      setSidebarOpen(false);
      return;
    }
    event.preventDefault();
    requestNavigation(href);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const initials = admin?.name
    ? admin.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  return (
    <div className="admin-root admin-shell">
      <button
        type="button"
        className="admin-sidebar-toggle"
        aria-expanded={sidebarOpen}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setSidebarOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-mark" aria-hidden />
          <div>
            <strong>Teotia &amp; Co.</strong>
            <span>Content admin</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, 'exact' in item ? item.exact : undefined);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'active' : undefined}
                onClick={(e) =>
                  handleNavClick(e, item.href, 'exact' in item ? item.exact : undefined)
                }
              >
                <item.Icon className="admin-nav-icon" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <span className="admin-user-avatar" aria-hidden>
              {initials}
            </span>
            <div className="admin-user-meta">
              {admin?.name && <span className="admin-user-name">{admin.name}</span>}
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <IconLogout size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
