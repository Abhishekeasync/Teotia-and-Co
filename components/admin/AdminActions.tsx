import Link from 'next/link';
import { IconSpinner } from './AdminIcons';

export type AdminActionVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type AdminActionProps = {
  label: string;
  icon?: React.ReactNode;
  variant?: AdminActionVariant;
  href?: string;
  target?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
};

function actionClass(variant: AdminActionVariant, loading?: boolean) {
  return [
    'admin-action',
    `admin-action--${variant}`,
    loading ? 'admin-action--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function AdminAction({
  label,
  icon,
  variant = 'neutral',
  href,
  target,
  disabled,
  loading,
  onClick,
}: AdminActionProps) {
  const className = actionClass(variant, loading);
  const content = loading ? <IconSpinner /> : icon;

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={className}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        aria-label={label}
        title={label}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || loading}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
      aria-label={label}
      title={label}
    >
      {content}
    </button>
  );
}

export function AdminActions({ children }: { children: React.ReactNode }) {
  return <div className="admin-actions">{children}</div>;
}
