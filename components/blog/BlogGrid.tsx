'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BlogPost } from '@/lib/blog-posts';
import { staggerContainerVariants } from '@/components/Reveal';
import { FeaturedPost } from './FeaturedPost';
import { SecondaryPostCard } from './SecondaryPostCard';
import { BlogCard } from './BlogCard';
import {
  BLOG_MOSAIC_BATCH_SIZE,
  getMosaicSlot,
  lgSpanClass,
} from './blog-mosaic-pattern';

type BlogGridProps = {
  posts: BlogPost[];
  featuredCount?: number;
  secondaryCount?: number;
  infiniteScroll?: boolean;
};

export function BlogGrid({
  posts,
  featuredCount = 1,
  secondaryCount = 2,
  infiniteScroll = false,
}: BlogGridProps) {
  const featuredPosts = posts.slice(0, featuredCount);
  const secondaryPosts = posts.slice(featuredCount, featuredCount + secondaryCount);
  const allRegularPosts = posts.slice(featuredCount + secondaryCount);

  const totalRegular = allRegularPosts.length;

  const [visibleRegularCount, setVisibleRegularCount] = useState(() =>
    infiniteScroll ? Math.min(BLOG_MOSAIC_BATCH_SIZE, totalRegular) : totalRegular
  );

  const regularPosts = infiniteScroll
    ? allRegularPosts.slice(0, visibleRegularCount)
    : allRegularPosts;

  const hasMore = infiniteScroll && visibleRegularCount < totalRegular;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [announcement, setAnnouncement] = useState('');

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setVisibleRegularCount((current) => {
      if (current >= totalRegular) {
        loadingRef.current = false;
        return current;
      }
      const next = Math.min(current + BLOG_MOSAIC_BATCH_SIZE, totalRegular);
      const added = next - current;
      if (added > 0) {
        setAnnouncement(
          added === 1 ? '1 more article loaded.' : `${added} more articles loaded.`
        );
      }
      return next;
    });

    window.setTimeout(() => {
      loadingRef.current = false;
    }, 200);
  }, [totalRegular]);

  useEffect(() => {
    if (!infiniteScroll || !hasMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { root: null, rootMargin: '400px 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, loadMore, visibleRegularCount]);

  useEffect(() => {
    if (!infiniteScroll) {
      setVisibleRegularCount(totalRegular);
    }
  }, [totalRegular, infiniteScroll]);

  return (
    <div className="blog-editorial">
      {featuredPosts.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: '0px 0px -48px 0px' }}
          variants={staggerContainerVariants}
          className="blog-editorial-featured"
        >
          <FeaturedPost post={featuredPosts[0]} className="blog-editorial-featured-primary" />
          {secondaryPosts.length > 0 && (
            <div className="blog-editorial-featured-secondary">
              {secondaryPosts.map((post) => (
                <SecondaryPostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {regularPosts.length > 0 && (
        <ul className="blog-editorial-grid blog-mosaic-grid" role="list">
          {regularPosts.map((post, index) => {
            const slot = getMosaicSlot(index);
            return (
              <li key={post.slug} className={`min-w-0 ${lgSpanClass(slot.lgSpan)}`} role="listitem">
                <BlogCard
                  post={post}
                  layout={slot.layout}
                  className="h-full"
                  revealOnScroll
                />
              </li>
            );
          })}
        </ul>
      )}

      {infiniteScroll && (
        <>
          <div ref={sentinelRef} className="blog-infinite-sentinel" aria-hidden="true" />
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
          {hasMore ? (
            <div className="blog-infinite-status" aria-hidden="true">
              <span className="blog-infinite-spinner" />
              <span>Loading more insights…</span>
            </div>
          ) : totalRegular > BLOG_MOSAIC_BATCH_SIZE ? (
            <p className="blog-infinite-end">You&apos;re all caught up.</p>
          ) : null}
        </>
      )}
    </div>
  );
}
