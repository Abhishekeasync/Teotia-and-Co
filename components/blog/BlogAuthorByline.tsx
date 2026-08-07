import Image from 'next/image';
import Link from 'next/link';

import { ApiAuthor } from '@/lib/api/types';

export function authorProfileHref(slug: string): string {
  return `/authors/details/${slug}`;
}

export function authorBlogFilterHref(slug: string): string {
  return `/blog?author=${encodeURIComponent(slug)}`;
}

type BlogAuthorBylineProps = {
  author: string;
  authorAvatar: string;
  authors?: ApiAuthor[];
  avatarSize?: number;
  nameClassName?: string;
  showDesignation?: boolean;
};

export function BlogAuthorByline({
  author,
  authorAvatar,
  authors,
  avatarSize = 36,
  nameClassName = 'font-semibold text-gray-900 text-sm hover:text-brand transition-colors',
  showDesignation = false,
}: BlogAuthorBylineProps) {
  const resolved = authors?.filter((item) => item.slug && item.name) ?? [];

  if (resolved.length >= 1) {
    const primary = resolved[0];

    return (
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={authorProfileHref(primary.slug)}
          className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label={`View ${primary.name}'s profile`}
        >
          <Image
            src={primary.profileImageUrl || authorAvatar}
            alt={primary.name}
            width={avatarSize}
            height={avatarSize}
            className="rounded-full object-cover ring-2 ring-white"
            style={{ width: avatarSize, height: avatarSize }}
            loading="lazy"
          />
        </Link>
        <div className="min-w-0">
          {resolved.length === 1 ? (
            <>
              <Link href={authorBlogFilterHref(primary.slug)} className={`${nameClassName} truncate block`}>
                {primary.name}
              </Link>
              {showDesignation && primary.designation && (
                <p className="blog-author-meta text-gray-500 text-xs mt-0.5">{primary.designation}</p>
              )}
            </>
          ) : (
            <p className={`${nameClassName} leading-snug`}>
              {resolved.map((profile, index) => (
                <span key={profile.id}>
                  {index > 0 && <span className="text-gray-400 font-normal">, </span>}
                  <Link
                    href={authorBlogFilterHref(profile.slug)}
                    className="hover:text-brand hover:underline underline-offset-2"
                  >
                    {profile.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      <Image
        src={authorAvatar}
        alt={author}
        width={avatarSize}
        height={avatarSize}
        className="rounded-full object-cover flex-shrink-0 ring-2 ring-white"
        style={{ width: avatarSize, height: avatarSize }}
        loading="lazy"
      />
      <span className={`${nameClassName} truncate`}>{author}</span>
    </div>
  );
}
