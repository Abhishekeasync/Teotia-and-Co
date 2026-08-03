'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlogPost } from '@/lib/blog-posts';
import { fadeUpVariants } from '@/components/Reveal';
import { CategoryBadge } from './CategoryBadge';
import { BlogPostMeta } from './BlogPostMeta';

const cardSurface =
  'group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-[transform,box-shadow,border-color] duration-300 ease-premium hover:shadow-[0_16px_40px_rgba(8,8,94,0.08)] hover:-translate-y-0.5 hover:border-brand-100/80';

type SecondaryPostCardProps = {
  post: BlogPost;
  className?: string;
};

export function SecondaryPostCard({ post, className = '' }: SecondaryPostCardProps) {
  return (
    <motion.article variants={fadeUpVariants} className={`${cardSurface} ${className}`}>
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 32vw"
            className="object-cover transition-transform duration-[400ms] ease-premium group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300"
            aria-hidden
          />
          <div className="absolute top-3 left-3">
            <CategoryBadge category={post.category} />
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4 lg:p-5">
          <h3 className="font-display text-base lg:text-lg font-bold text-heading leading-snug mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2 flex-1">
            {post.excerpt}
          </p>
          <BlogPostMeta
            author={post.author}
            authorAvatar={post.authorAvatar}
            authors={post.authors}
            date={post.date}
            readTime={post.readTime}
            variant="timestamps"
          />
        </div>
      </Link>
    </motion.article>
  );
}
