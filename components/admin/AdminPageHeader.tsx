import Link from 'next/link';
import { IconPlus } from './AdminIcons';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  primaryAction?: { href: string; label: string };
};

export function AdminPageHeader({
  title,
  description,
  actions,
  primaryAction,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header-text">
        <h2>{title}</h2>
        {description && <p className="admin-header-desc">{description}</p>}
      </div>
      <div className="admin-header-actions">
        {actions}
        {primaryAction && (
          <Link href={primaryAction.href} className="admin-btn admin-btn-primary">
            <IconPlus />
            {primaryAction.label}
          </Link>
        )}
      </div>
    </header>
  );
}
