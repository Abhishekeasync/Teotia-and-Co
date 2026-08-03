'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlogPost } from '@/lib/blog-posts';
import { fadeUpVariants } from '@/components/Reveal';
import { CategoryBadge } from './CategoryBadge';
import { BlogPostMeta } from './BlogPostMeta';

const cardSurface =
  'group relative flex flex-col h-full overflow-hidden rounded-3xl bg-white border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-[transform,box-shadow,border-color] duration-300 ease-premium hover:shadow-[0_20px_56px_rgba(8,8,94,0.1)] hover:-translate-y-0.5 hover:border-brand-100/80';

type FeaturedPostProps = {
  post: BlogPost;
  className?: string;
};

export function FeaturedPost({ post, className = '' }: FeaturedPostProps) {
  return (
    <motion.article variants={fadeUpVariants} className={`${cardSurface} ${className}`}>
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-t-3xl"
      >
        <div className="relative aspect-[16/10] lg:aspect-[16/11] xl:aspect-[16/10] overflow-hidden bg-gray-100">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover transition-transform duration-[400ms] ease-premium group-hover:scale-[1.03]"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-heading/50 via-heading/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-75"
            aria-hidden
          />
          <div className="absolute top-5 left-5">
            <CategoryBadge category={post.category} />
          </div>
        </div>

        <div className="flex flex-col flex-1 p-6 pb-0 lg:p-8 lg:pt-7 lg:pb-0">
          <h2 className="font-display text-2xl lg:text-[1.75rem] xl:text-3xl font-bold text-heading leading-[1.2] mb-3 line-clamp-3">
            {post.title}
          </h2>
          <p className="text-base text-gray-600 leading-relaxed line-clamp-3 max-w-3xl">
            {post.excerpt}
          </p>
        </div>
      </Link>

      <div className="mt-auto p-6 pt-4 lg:p-8 lg:pt-5 border-t border-gray-100">
        <BlogPostMeta
          author={post.author}
          authorAvatar={post.authorAvatar}
          authors={post.authors}
          date={post.date}
          readTime={post.readTime}
          variant="featured"
        />
      </div>
    </motion.article>
  );
}
