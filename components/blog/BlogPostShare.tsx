'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { toast } from '@/lib/toast';

export type BlogShareLinksData = {
  pageUrl: string;
  linkedIn: string;
  whatsApp: string;
  x: string;
};

type BlogPostShareProps = {
  heading: string;
  links: BlogShareLinksData;
};

type ShareOption = {
  id: string;
  label: string;
  href?: string;
  action?: 'copy';
  icon: string;
};

function ShareIconButton({
  open,
  onToggle,
  controlsId,
}: {
  open: boolean;
  onToggle: () => void;
  controlsId: string;
}) {
  return (
    <button
      type="button"
      className={`blog-share-trigger${open ? ' is-open' : ''}`}
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls={controlsId}
      aria-label="Share post"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51 15.42 17.49" />
        <path d="M15.41 6.51 8.59 10.49" />
      </svg>
      <span>Share</span>
    </button>
  );
}

export function BlogPostShare({ heading, links }: BlogPostShareProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const options: ShareOption[] = [
    { id: 'linkedin', label: 'LinkedIn', href: links.linkedIn, icon: 'in' },
    { id: 'whatsapp', label: 'WhatsApp', href: links.whatsApp, icon: 'wa' },
    { id: 'x', label: 'X (Twitter)', href: links.x, icon: 'x' },
    { id: 'copy', label: 'Copy link', action: 'copy', icon: 'link' },
  ];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(links.pageUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
    setOpen(false);
  };

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: heading,
          text: heading,
          url: links.pageUrl,
        });
        setOpen(false);
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return true;
        }
      }
    }
    return false;
  };

  const handleNativeShare = async () => {
    const shared = await nativeShare();
    if (!shared) {
      toast.message('Use one of the options below to share this post');
    }
  };

  const handleOptionClick = async (option: ShareOption) => {
    if (option.action === 'copy') {
      await copyLink();
      return;
    }
    setOpen(false);
  };

  return (
    <div className="blog-share" ref={rootRef}>
      <ShareIconButton
        open={open}
        onToggle={() => setOpen((value) => !value)}
        controlsId={menuId}
      />

      {open && (
        <div
          id={menuId}
          className="blog-share-menu"
          role="menu"
          aria-label="Share options"
        >
          <p className="blog-share-menu-title">Share this post</p>

          {canNativeShare && (
            <button
              type="button"
              className="blog-share-menu-item blog-share-menu-item--native"
              role="menuitem"
              onClick={handleNativeShare}
            >
              <span className="blog-share-menu-icon" aria-hidden>
                ↗
              </span>
              Share via device
            </button>
          )}

          {options.map((option) =>
            option.href ? (
              <a
                key={option.id}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-share-menu-item"
                role="menuitem"
                onClick={() => handleOptionClick(option)}
              >
                <span
                  className={`blog-share-menu-icon blog-share-menu-icon--${option.id}`}
                  aria-hidden
                >
                  {option.icon}
                </span>
                {option.label}
              </a>
            ) : (
              <button
                key={option.id}
                type="button"
                className="blog-share-menu-item"
                role="menuitem"
                onClick={() => handleOptionClick(option)}
              >
                <span
                  className={`blog-share-menu-icon blog-share-menu-icon--${option.id}`}
                  aria-hidden
                >
                  {option.icon}
                </span>
                {option.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function BlogShareBar({ links }: BlogPostShareProps) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(links.pageUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="blog-share-bar" aria-label="Share this post">
      <div className="blog-share-bar-actions">
        <a
          href={links.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-bar-btn blog-share-bar-btn--linkedin"
          aria-label="Share on LinkedIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
            <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/>
          </svg>
        </a>
        <a
          href={links.whatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-bar-btn blog-share-bar-btn--whatsapp"
          aria-label="Share on WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </a>
        <a
          href={links.x}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-bar-btn blog-share-bar-btn--x"
          aria-label="Share on X"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
          </svg>
        </a>
        <button
          type="button"
          className="blog-share-bar-btn blog-share-bar-btn--copy"
          aria-label="Copy link"
          onClick={copyLink}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
            <path d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v40c0 30.9-25.1 56-56 56H56c-30.9 0-56-25.1-56-56V184c0-30.9 25.1-56 56-56z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
