'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  CSSProperties,
  FocusEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { ApiAuthor } from '@/lib/api/types';

import './author-stack.css';

const VISIBLE_AUTHOR_LIMIT = 3;
const TOOLTIP_GAP = 10;
const VIEWPORT_PAD = 8;

type AuthorStackProps = {
  authors: ApiAuthor[];
  fallbackAvatar: string;
  fallbackName: string;
  size?: number;
};

type StackAuthor = {
  key: string;
  name: string;
  designation: string | null;
  imageUrl: string | null;
  slug?: string;
};

type StackItem =
  | (StackAuthor & { kind: 'author' })
  | {
      kind: 'overflow';
      key: 'overflow';
      remaining: Array<{ name: string; designation: string | null }>;
    };

type TooltipState = {
  key: string;
  title: string;
  subtitle?: string;
  side: 'top' | 'bottom';
  x: number;
  y: number;
  caretX: number;
  ready: boolean;
  moving: boolean;
};

function cleanDesignation(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;
  return trimmed;
}

function initialsFor(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function canHoverFine(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function AuthorAvatarFace({
  src,
  name,
  size,
}: {
  src: string | null;
  name: string;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!showImage) {
    return (
      <span className="author-stack-fallback" aria-hidden>
        {initialsFor(name)}
      </span>
    );
  }

  return (
    <Image
      src={src as string}
      alt=""
      width={size}
      height={size}
      className="author-stack-face"
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function placeTooltip(
  anchor: DOMRect,
  tooltip: HTMLElement
): Pick<TooltipState, 'side' | 'x' | 'y' | 'caretX'> {
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;
  const centerX = anchor.left + anchor.width / 2;
  let x = centerX - width / 2;
  let side: 'top' | 'bottom' = 'top';
  let y = anchor.top - height - TOOLTIP_GAP;

  if (y < VIEWPORT_PAD) {
    side = 'bottom';
    y = anchor.bottom + TOOLTIP_GAP;
  }

  const maxX = window.innerWidth - width - VIEWPORT_PAD;
  x = Math.min(Math.max(VIEWPORT_PAD, x), Math.max(VIEWPORT_PAD, maxX));

  if (y + height > window.innerHeight - VIEWPORT_PAD) {
    y = Math.max(VIEWPORT_PAD, window.innerHeight - height - VIEWPORT_PAD);
  }

  return {
    side,
    x,
    y,
    caretX: Math.min(Math.max(12, centerX - x), width - 12),
  };
}

export function AuthorStack({
  authors,
  fallbackAvatar,
  fallbackName,
  size = 36,
}: AuthorStackProps) {
  const rootRef = useRef<HTMLUListElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mounted, setMounted] = useState(false);

  const resolvedAuthors = useMemo<StackAuthor[]>(() => {
    const valid = authors.filter((author) => author.name?.trim());
    if (valid.length > 0) {
      return valid.map((author) => ({
        key: String(author.id),
        name: author.name.trim(),
        designation: cleanDesignation(author.designation) ?? null,
        imageUrl: author.profileImageUrl || fallbackAvatar,
        slug: author.slug || undefined,
      }));
    }

    return [
      {
        key: 'fallback',
        name: fallbackName.trim() || 'Author',
        designation: null,
        imageUrl: fallbackAvatar,
      },
    ];
  }, [authors, fallbackAvatar, fallbackName]);

  const items = useMemo<StackItem[]>(() => {
    if (resolvedAuthors.length <= VISIBLE_AUTHOR_LIMIT) {
      return resolvedAuthors.map((author) => ({ kind: 'author', ...author }));
    }

    const visible = resolvedAuthors.slice(0, VISIBLE_AUTHOR_LIMIT);
    const remaining = resolvedAuthors.slice(VISIBLE_AUTHOR_LIMIT);
    return [
      ...visible.map((author) => ({ kind: 'author' as const, ...author })),
      {
        kind: 'overflow',
        key: 'overflow',
        remaining: remaining.map((author) => ({
          name: author.name,
          designation: author.designation,
        })),
      },
    ];
  }, [resolvedAuthors]);

  const canStack = items.length > 1;

  const tooltipCopy = useCallback(
    (key: string): { title: string; subtitle?: string } | null => {
      const item = items.find((entry) => entry.key === key);
      if (!item) return null;

      if (item.kind === 'overflow') {
        const names = item.remaining.map((author) => author.name).join(', ');
        const single = item.remaining.length === 1 ? item.remaining[0] : null;
        return {
          title: `+${item.remaining.length} more`,
          subtitle: single?.designation ? `${single.name} · ${single.designation}` : names,
        };
      }

      return {
        title: item.name,
        subtitle: item.designation || undefined,
      };
    },
    [items]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateTooltipPosition = useCallback(() => {
    if (!activeKey || !tooltipRef.current || !rootRef.current) return;
    const trigger = rootRef.current.querySelector<HTMLElement>(`[data-author-key="${activeKey}"]`);
    if (!trigger) return;
    const copy = tooltipCopy(activeKey);
    if (!copy) return;
    const next = placeTooltip(trigger.getBoundingClientRect(), tooltipRef.current);
    setTooltip((current) => ({
      key: activeKey,
      ...copy,
      ...next,
      ready: true,
      moving: Boolean(current?.ready),
    }));
  }, [activeKey, tooltipCopy]);

  useLayoutEffect(() => {
    if (!activeKey) {
      setTooltip((current) => (current ? { ...current, ready: false, moving: false } : null));
      const hide = window.setTimeout(() => setTooltip(null), 160);
      return () => window.clearTimeout(hide);
    }

    const copy = tooltipCopy(activeKey);
    if (!copy) {
      setTooltip(null);
      return;
    }

    const switching = Boolean(tooltipRef.current);
    setTooltip((current) => ({
      key: activeKey,
      title: copy.title,
      subtitle: copy.subtitle,
      side: current?.ready ? current.side : 'top',
      x: current?.ready ? current.x : 0,
      y: current?.ready ? current.y : 0,
      caretX: current?.ready ? current.caretX : 50,
      ready: Boolean(current?.ready),
      moving: Boolean(current?.ready),
    }));

    let delay: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (switching) {
        updateTooltipPosition();
        return;
      }
      delay = window.setTimeout(updateTooltipPosition, 70);
    });
    window.addEventListener('scroll', updateTooltipPosition, true);
    window.addEventListener('resize', updateTooltipPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      if (delay) window.clearTimeout(delay);
      window.removeEventListener('scroll', updateTooltipPosition, true);
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, [activeKey, tooltipCopy, updateTooltipPosition]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setActiveKey(null);
      setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!activeKey && !open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setActiveKey(null);
      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [activeKey, open]);

  const closeIfLeaving = (event: FocusEvent<HTMLUListElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node)) return;
    setActiveKey(null);
    setOpen(false);
  };

  const activate = (key: string) => {
    setActiveKey(key);
    if (canStack) setOpen(true);
  };

  const handleTriggerClick = (event: MouseEvent, key: string) => {
    if (canHoverFine()) return;
    if (activeKey === key) return;
    event.preventDefault();
    event.stopPropagation();
    activate(key);
  };

  const ariaLabelFor = (item: StackItem): string => {
    if (item.kind === 'overflow') {
      return `+${item.remaining.length} more authors: ${item.remaining.map((author) => author.name).join(', ')}`;
    }
    return item.designation ? `${item.name}, ${item.designation}` : item.name;
  };

  return (
    <>
      <ul
        ref={rootRef}
        className={`author-stack${open ? ' is-open' : ''}`}
        role="list"
        aria-label="Article authors"
        style={{
          '--author-size': `${size}px`,
          '--author-slots': String(items.length),
        } as CSSProperties}
        onMouseEnter={() => {
          if (canStack && canHoverFine()) setOpen(true);
        }}
        onMouseLeave={() => {
          if (!canHoverFine()) return;
          setOpen(false);
          setActiveKey(null);
        }}
        onBlur={closeIfLeaving}
      >
        {items.map((item, index) => {
          const isActive = activeKey === item.key;
          const describedBy = isActive ? tooltipId : undefined;

          const face =
            item.kind === 'overflow' ? (
              <span className="author-stack-fallback author-stack-overflow" aria-hidden>
                +{item.remaining.length}
              </span>
            ) : (
              <AuthorAvatarFace src={item.imageUrl} name={item.name} size={size} />
            );

          const className = `author-stack-trigger${item.kind === 'overflow' ? ' author-stack-overflow' : ''}`;

          return (
            <li
              key={item.key}
              className={`author-stack-slot${isActive ? ' is-active' : ''}`}
              role="listitem"
              style={{ '--i': String(index) } as CSSProperties}
            >
              {item.kind === 'author' && item.slug ? (
                <Link
                  href={`/authors/details/${item.slug}`}
                  className={className}
                  data-author-key={item.key}
                  aria-label={
                    item.designation
                      ? `View ${item.name}'s profile, ${item.designation}`
                      : `View ${item.name}'s profile`
                  }
                  aria-describedby={describedBy}
                  onMouseEnter={() => activate(item.key)}
                  onFocus={() => activate(item.key)}
                  onClick={(event) => handleTriggerClick(event, item.key)}
                >
                  {face}
                </Link>
              ) : (
                <button
                  type="button"
                  className={className}
                  data-author-key={item.key}
                  aria-label={ariaLabelFor(item)}
                  aria-describedby={describedBy}
                  onMouseEnter={() => activate(item.key)}
                  onFocus={() => activate(item.key)}
                  onClick={(event) => handleTriggerClick(event, item.key)}
                >
                  {face}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {mounted &&
        tooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={`author-tooltip${tooltip.ready ? ' is-ready' : ''}${
              tooltip.moving ? ' is-moving' : ''
            }`}
            data-side={tooltip.side}
            style={{
              '--tx': `${tooltip.x}px`,
              '--ty': `${tooltip.y}px`,
              '--caret-x': `${tooltip.caretX}px`,
            } as CSSProperties}
          >
            <span className="author-tooltip-name">{tooltip.title}</span>
            {tooltip.subtitle ? (
              <span className="author-tooltip-role">{tooltip.subtitle}</span>
            ) : null}
            <span className="author-tooltip-caret" aria-hidden />
          </div>,
          document.body
        )}
    </>
  );
}
