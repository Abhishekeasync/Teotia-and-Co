type AdminPaginationProps = {
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

export function AdminPagination({
  page,
  totalPages,
  loading,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <button
        type="button"
        className="admin-btn admin-btn-secondary admin-btn-sm"
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="admin-pagination-label">
        Page <strong>{page}</strong> of {totalPages}
      </span>
      <button
        type="button"
        className="admin-btn admin-btn-secondary admin-btn-sm"
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
