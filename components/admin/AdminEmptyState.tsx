type AdminEmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon" aria-hidden>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="10" width="24" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 18h12M14 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="admin-empty-state-title">{title}</p>
      {description && <p className="admin-empty-state-desc">{description}</p>}
      {action && <div className="admin-empty-state-action">{action}</div>}
    </div>
  );
}
