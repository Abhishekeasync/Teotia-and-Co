import { ApiAuthor } from '@/lib/api/types';
import { AuthorStack } from './AuthorStack';

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
};

export function BlogAuthorByline({
  author,
  authorAvatar,
  authors,
  avatarSize = 36,
}: BlogAuthorBylineProps) {
  const resolved = authors?.filter((item) => item.slug && item.name) ?? [];

  return (
    <AuthorStack
      authors={resolved}
      fallbackAvatar={authorAvatar}
      fallbackName={author}
      size={avatarSize}
    />
  );
}
