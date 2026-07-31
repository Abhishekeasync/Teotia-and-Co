export function AdminStatSkeleton() {
  return (
    <div className="admin-stat-card admin-skeleton-card" aria-hidden>
      <div className="admin-skeleton admin-skeleton-label" />
      <div className="admin-skeleton admin-skeleton-value" />
      <div className="admin-skeleton admin-skeleton-sub" />
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="admin-skeleton-table" aria-label="Loading">
      <div className="admin-skeleton-row admin-skeleton-header">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="admin-skeleton admin-skeleton-cell" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="admin-skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="admin-skeleton admin-skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminPanelSkeleton() {
  return (
    <div className="admin-panel admin-skeleton-panel" aria-hidden>
      <div className="admin-panel-header">
        <div className="admin-skeleton admin-skeleton-title" />
      </div>
      <div style={{ padding: '1rem 1.25rem' }}>
        <AdminTableSkeleton rows={4} cols={4} />
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <>
      <div className="admin-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdminStatSkeleton key={i} />
        ))}
      </div>
      <div className="admin-recent-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <AdminPanelSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
