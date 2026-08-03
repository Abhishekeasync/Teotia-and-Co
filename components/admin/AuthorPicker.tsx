'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminNavigationGuard } from '@/lib/hooks/AdminNavigationGuard';
import { IconPlus } from './AdminIcons';

export type AuthorPickerAuthor = {
  id: number;
  name: string;
  designation?: string | null;
  profileImageUrl?: string | null;
};

type AuthorPickerProps = {
  authors: AuthorPickerAuthor[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  onRefresh?: () => void;
  onBeforeNavigate?: () => void | Promise<void>;
  loading?: boolean;
};

function AuthorAvatar({
  name,
  imageUrl,
  size = 'md',
}: {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md';
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className={`admin-author-card-avatar admin-author-card-avatar--${size}`}
      aria-hidden
    >
      {imageUrl ? <img src={imageUrl} alt="" /> : initial}
    </span>
  );
}

export function AuthorPicker({
  authors,
  selectedIds,
  onChange,
  onRefresh,
  onBeforeNavigate,
  loading = false,
}: AuthorPickerProps) {
  const pathname = usePathname();
  const { navigateWithoutGuard } = useAdminNavigationGuard();
  const [query, setQuery] = useState('');

  const goToNewAuthor = async () => {
    await onBeforeNavigate?.();
    const returnTo = encodeURIComponent(pathname ?? '/admin/blogs/new');
    navigateWithoutGuard(`/admin/authors/new?returnTo=${returnTo}`);
  };

  const filteredAuthors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.designation?.toLowerCase().includes(q) ?? false)
    );
  }, [authors, query]);

  const selectedAuthors = useMemo(
    () => authors.filter((a) => selectedIds.includes(a.id)),
    [authors, selectedIds]
  );

  const toggleAuthor = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="admin-author-picker">
      <div className="admin-author-picker-header">
        <div className="admin-author-picker-header-text">
          <span className="admin-field-label" id="author-picker-label">Authors</span>
          {selectedIds.length > 0 && (
            <span className="admin-author-picker-badge">
              {selectedIds.length} selected
            </span>
          )}
        </div>
        <div className="admin-author-picker-actions">
          {onRefresh && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh list'}
            </button>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={goToNewAuthor}
          >
            <IconPlus size={14} />
            New author
          </button>
        </div>
      </div>

      <div className="admin-author-picker-body">
        {authors.length === 0 ? (
          <div className="admin-author-picker-empty">
            <p>No authors yet. Create a profile first, then assign them to this post.</p>
            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={goToNewAuthor}
            >
              <IconPlus size={14} />
              Create author
            </button>
          </div>
        ) : (
          <>
            {selectedAuthors.length > 0 && (
              <div
                className="admin-author-selected-chips"
                aria-label="Selected authors"
              >
                {selectedAuthors.map((author) => (
                  <button
                    key={author.id}
                    type="button"
                    className="admin-author-chip"
                    onClick={() => toggleAuthor(author.id)}
                    title={`Remove ${author.name}`}
                  >
                    <AuthorAvatar
                      name={author.name}
                      imageUrl={author.profileImageUrl}
                      size="sm"
                    />
                    <span>{author.name}</span>
                    <span className="admin-author-chip-remove" aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}

            {authors.length > 4 && (
              <div className="admin-author-picker-search">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search authors…"
                  aria-label="Search authors"
                />
              </div>
            )}

            {filteredAuthors.length === 0 ? (
              <p className="admin-field-hint admin-author-picker-no-results">
                No authors match &quot;{query}&quot;.
              </p>
            ) : (
              <div
                className="admin-author-grid"
                role="group"
                aria-labelledby="author-picker-label"
              >
                {filteredAuthors.map((author) => {
                  const selected = selectedIds.includes(author.id);
                  return (
                    <button
                      key={author.id}
                      type="button"
                      className={`admin-author-card${selected ? ' admin-author-card--selected' : ''}`}
                      onClick={() => toggleAuthor(author.id)}
                      aria-pressed={selected}
                    >
                      <AuthorAvatar
                        name={author.name}
                        imageUrl={author.profileImageUrl}
                      />
                      <span className="admin-author-card-text">
                        <span className="admin-author-card-name">{author.name}</span>
                        {author.designation && (
                          <span className="admin-author-card-role">
                            {author.designation}
                          </span>
                        )}
                      </span>
                      <span
                        className={`admin-author-card-check${selected ? ' admin-author-card-check--on' : ''}`}
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <p className="admin-field-hint">
              Click to select authors shown on the published post. Use{' '}
              <strong>New author</strong> to create one — you&apos;ll return here after saving.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
