import Image from 'next/image';

type BlogPostMetaProps = {
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  variant?: 'featured' | 'regular' | 'timestamps';
};

export function BlogPostMeta({
  author,
  authorAvatar,
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
    <div className="flex items-center gap-3">
      <Image
        src={authorAvatar}
        alt={author}
        width={avatarSize}
        height={avatarSize}
        className="rounded-full object-cover flex-shrink-0 ring-2 ring-white"
        style={{ width: avatarSize, height: avatarSize }}
        loading="lazy"
      />
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-gray-900 truncate text-sm">
          {author}
        </span>
        <span className="text-gray-500 text-xs">
          <time dateTime={date}>{date}</time>
          <span className="mx-1" aria-hidden="true">
            ·
          </span>
          {readTime}
        </span>
      </div>
    </div>
  );
}
