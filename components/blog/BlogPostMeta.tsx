import { ApiAuthor } from '@/lib/api/types';
import { BlogAuthorByline } from './BlogAuthorByline';

type BlogPostMetaProps = {
  author: string;
  authorAvatar: string;
  authors?: ApiAuthor[];
  date: string;
  readTime: string;
  variant?: 'featured' | 'regular' | 'timestamps';
};

export function BlogPostMeta({
  author,
  authorAvatar,
  authors,
  date,
  readTime,
  variant = 'regular',
}: BlogPostMetaProps) {
  if (variant === 'timestamps') {
    return (
      <p className="text-xs text-gray-500 font-medium tabular-nums">
        <time dateTime={date}>{date}</time>
        <span className="mx-1.5 text-gray-300" aria-hidden="true">
          ·
        </span>
        <span>{readTime}</span>
      </p>
    );
  }

  const avatarSize = variant === 'featured' ? 44 : 36;

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <BlogAuthorByline
        author={author}
        authorAvatar={authorAvatar}
        authors={authors}
        avatarSize={avatarSize}
      />
      <span className="text-gray-500 text-xs tabular-nums">
        <time dateTime={date}>{date}</time>
        <span className="mx-1" aria-hidden="true">
          ·
        </span>
        {readTime}
      </span>
    </div>
  );
}
