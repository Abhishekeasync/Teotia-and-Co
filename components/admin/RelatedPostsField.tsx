'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminApi } from '@/lib/api/client';
import { normalizeApiBlogs } from '@/lib/api/normalize';
import { ApiBlogListResponse, ApiRelatedPost } from '@/lib/api/types';

export type RelatedPostItem = ApiRelatedPost;

type RelatedPostsFieldProps = {
  blogId?: number;
  selected: RelatedPostItem[];
  onChange: (items: RelatedPostItem[]) => void;
};

const PAGE_SIZE = 12;

function formatPublishedDate(iso: string | null): string {
  if (!iso) return 'Not published';
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status?: 'draft' | 'published' }) {
  const label = status === 'published' ? 'Published' : 'Draft';
  return (
    <span className={`admin-related-status admin-related-status--${status ?? 'draft'}`}>
      {label}
    </span>
  );
}

function RelatedPostThumb({
  imageUrl,
  title,
}: {
  imageUrl: string | null;
  title: string;
}) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="admin-related-thumb-image" />;
  }
  return <span className="admin-related-thumb-fallback" aria-hidden>{title.charAt(0)}</span>;
}

export function RelatedPostsField({ blogId, selected, onChange }: RelatedPostsFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<RelatedPostItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSelection, setDraftSelection] = useState<Map<number, RelatedPostItem>>(new Map());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await adminApi.blogs.list({
          page: nextPage,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          excludeId: blogId,
        });
        const data = res as { data: ApiBlogListResponse };
        const blogs = normalizeApiBlogs(
          (data.data?.blogs ?? []) as Parameters<typeof normalizeApiBlogs>[0],
        );
        const mapped: RelatedPostItem[] = blogs.map((blog) => ({
          id: blog.id,
          slug: blog.slug,
          heading: blog.heading,
          shortDescription: blog.shortDescription,
          featuredImageUrl: blog.featuredImageUrl,
          publishedAt: blog.publishedAt,
          status: blog.status,
          category: {
            id: blog.categoryId,
            name: blog.categoryName,
            slug: blog.categorySlug,
          },
        }));

        setItems((prev) => (append ? [...prev, ...mapped] : mapped));
        setTotalPages(data.data?.pagination?.totalPages ?? 1);
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blogs');
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [blogId, debouncedSearch],
  );

  useEffect(() => {
    if (!modalOpen) return;
    void loadPage(1, false);
  }, [modalOpen, loadPage]);

  useEffect(() => {
    if (!modalOpen) return;
    const map = new Map<number, RelatedPostItem>();
    for (const item of selected) {
      map.set(item.id, item);
    }
    setDraftSelection(map);
    setSearch('');
    setDebouncedSearch('');
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [modalOpen, selected]);

  useEffect(() => {
    if (!modalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [modalOpen]);

  const handleScroll = () => {
    const node = listRef.current;
    if (!node || loading || loadingMore || page >= totalPages) return;
    const nearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 80;
    if (nearBottom) {
      void loadPage(page + 1, true);
    }
  };

  const toggleDraftItem = (item: RelatedPostItem) => {
    setDraftSelection((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  };

  const applySelection = () => {
    const ordered = selected
      .filter((item) => draftSelection.has(item.id))
      .concat(
        [...draftSelection.values()].filter((item) => !selectedIds.has(item.id)),
      );
    onChange(ordered);
    setModalOpen(false);
  };

  const removeSelected = (id: number) => {
    onChange(selected.filter((item) => item.id !== id));
  };

  const reorderSelected = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const next = [...selected];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  const draftCount = draftSelection.size;

  return (
    <div className="admin-related-posts-field">
      <div className="admin-related-posts-header">
        <div>
          <span className="admin-field-label">Related Posts</span>
          <p className="admin-field-hint">
            Manually curate related articles shown in the blog sidebar.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={() => setModalOpen(true)}
        >
          Select Related Posts
        </button>
      </div>

      {selected.length > 0 ? (
        <ul className="admin-related-selected-list" aria-label="Selected related posts">
          {selected.map((item, index) => (
            <li
              key={item.id}
              className={`admin-related-selected-item${dragIndex === index ? ' is-dragging' : ''}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorderSelected(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
            >
              <button
                type="button"
                className="admin-related-drag-handle"
                aria-label={`Reorder ${item.heading}`}
                tabIndex={-1}
              >
                ⋮⋮
              </button>
              <div className="admin-related-thumb">
                <RelatedPostThumb imageUrl={item.featuredImageUrl} title={item.heading} />
              </div>
              <div className="admin-related-selected-copy">
                <strong>{item.heading}</strong>
                <span className="admin-related-selected-meta">
                  <StatusBadge status={item.status} />
                  <span>{item.category.name}</span>
                </span>
              </div>
              <button
                type="button"
                className="admin-related-remove"
                aria-label={`Remove ${item.heading}`}
                onClick={() => removeSelected(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-related-empty">No related posts selected yet.</p>
      )}

      {modalOpen && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="admin-modal admin-related-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="related-posts-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="admin-related-modal-header">
              <div>
                <h3 id="related-posts-modal-title">Select Related Posts</h3>
                <p className="admin-related-modal-subtitle">
                  {draftCount} selected · Search and pick multiple posts
                </p>
              </div>
              <button
                type="button"
                className="admin-related-modal-close"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="admin-related-search-wrap">
              <input
                ref={searchInputRef}
                type="search"
                className="admin-related-search"
                placeholder="Search blogs by title…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search blogs"
              />
            </div>

            <div
              ref={listRef}
              className="admin-related-modal-list"
              onScroll={handleScroll}
              role="listbox"
              aria-multiselectable="true"
              aria-label="Available blog posts"
            >
              {loading && items.length === 0 && (
                <p className="admin-related-modal-state">Loading posts…</p>
              )}
              {error && (
                <p className="admin-related-modal-state admin-related-modal-state--error">
                  {error}
                </p>
              )}
              {!loading && !error && items.length === 0 && (
                <p className="admin-related-modal-state">No blogs match your search.</p>
              )}

              {items.map((item) => {
                const checked = draftSelection.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={`admin-related-option${checked ? ' is-selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDraftItem(item)}
                    />
                    <div className="admin-related-thumb admin-related-thumb--sm">
                      <RelatedPostThumb imageUrl={item.featuredImageUrl} title={item.heading} />
                    </div>
                    <div className="admin-related-option-copy">
                      <strong>{item.heading}</strong>
                      <span className="admin-related-option-meta">
                        <StatusBadge status={item.status} />
                        <span>{item.category.name}</span>
                        <span>{formatPublishedDate(item.publishedAt)}</span>
                      </span>
                    </div>
                  </label>
                );
              })}

              {loadingMore && (
                <p className="admin-related-modal-state">Loading more…</p>
              )}
            </div>

            <footer className="admin-related-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={applySelection}
              >
                Apply ({draftCount})
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
