'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlogPost } from '@/lib/blog-posts';
import { fadeUpVariants } from '@/components/Reveal';
import { CategoryBadge } from './CategoryBadge';
import { BlogPostMeta } from './BlogPostMeta';
import { BlogTagList } from './BlogTagList';

export type BlogCardLayout = 'vertical' | 'small';

const cardSurface =
  'group relative flex h-full overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-[transform,box-shadow,border-color] duration-300 ease-premium hover:shadow-[0_16px_40px_rgba(8,8,94,0.08)] hover:-translate-y-0.5 hover:border-brand-100/80';

type BlogCardProps = {
  post: BlogPost;
  className?: string;
  layout?: BlogCardLayout;
  revealOnScroll?: boolean;
};

export function BlogCard({
  post,
  className = '',
  layout = 'vertical',
  revealOnScroll = false,
}: BlogCardProps) {
  const isSmall = layout === 'small';

  const revealProps = revealOnScroll
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12, margin: '0px 0px -24px 0px' },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
      }
    : { variants: fadeUpVariants };

  return (
    <motion.article
      {...revealProps}
      className={`${cardSurface} flex flex-col ${className}`}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full w-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-2xl"
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-gray-100 ${
            isSmall
              ? 'aspect-[4/3] rounded-t-2xl blog-card-small-media'
              : 'aspect-[16/10] rounded-t-2xl blog-card-vertical-media'
          }`}
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes={isSmall ? '(max-width: 1024px) 100vw, 28vw' : '(max-width: 1024px) 100vw, 40vw'}
            className="object-cover transition-transform duration-[400ms] ease-premium group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-65 group-hover:opacity-45 transition-opacity duration-300"
            aria-hidden
          />
          <div className={`absolute ${isSmall ? 'top-3 left-3' : 'top-4 left-4'}`}>
            <CategoryBadge category={post.category} />
          </div>
        </div>

        <div className={`flex flex-1 flex-col min-w-0 ${isSmall ? 'p-4' : 'p-5 lg:p-6'}`}>
          <h3
            className={`font-display font-bold text-heading leading-snug mb-2 line-clamp-2 ${
              isSmall ? 'text-base' : 'text-lg lg:text-xl'
            }`}
          >
            {post.title}
          </h3>
          <p
            className={`text-gray-600 leading-relaxed flex-1 ${
              isSmall ? 'text-sm mb-3 line-clamp-2' : 'text-sm mb-4 line-clamp-3'
            }`}
          >
            {post.excerpt}
          </p>
          <div className="mt-auto">
            <BlogPostMeta
              author={post.author}
              authorAvatar={post.authorAvatar}
              date={post.date}
              readTime={post.readTime}
              variant={isSmall ? 'timestamps' : 'regular'}
            />
          </div>
        </div>
      </Link>

      {post.tags && post.tags.length > 0 && (
        <div className={isSmall ? 'px-4 pb-4' : 'px-5 pb-5 lg:px-6 lg:pb-6'}>
          <BlogTagList tags={post.tags} />
        </div>
      )}
    </motion.article>
  );
}
