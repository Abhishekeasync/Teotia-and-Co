'use client';

import { useEffect } from 'react';
import { publicApi } from '@/lib/api/client';

interface BlogViewTrackerProps {
  slug: string;
}

const STORAGE_PREFIX = 'blog_view_';

function getStorageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

function hasPendingView(slug: string): boolean {
  try {
    const raw = localStorage.getItem(getStorageKey(slug));
    if (!raw) return true; // never visited

    const { expiresAt, viewKey } = JSON.parse(raw) as { expiresAt: number; viewKey: string };
    if (!expiresAt || !viewKey) return true;

    return Date.now() > expiresAt;
  } catch {
    return true;
  }
}

function markViewSent(slug: string, viewKey: string): void {
  try {
    const now = new Date();
    // Expires at start of next UTC day
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    localStorage.setItem(
      getStorageKey(slug),
      JSON.stringify({ expiresAt: tomorrow.getTime(), viewKey }),
    );
  } catch {
    // localStorage unavailable (private mode, etc.) — silently ignore
  }
}

function generateViewKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for older environments
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function BlogViewTracker({ slug }: BlogViewTrackerProps) {
  useEffect(() => {
    if (!hasPendingView(slug)) return;

    const viewKey = generateViewKey();

    publicApi.blogs
      .recordView(slug, viewKey)
      .then(() => {
        markViewSent(slug, viewKey);
      })
      .catch(() => {
        // Silently fail — never block page load or show an error for this
      });
  }, [slug]);

  // Renders nothing — purely a side-effect component
  return null;
}
