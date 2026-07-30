import Link from 'next/link';

type BlogTagListProps = {
  tags: string[];
  className?: string;
};

export function BlogTagList({ tags, className = '' }: BlogTagListProps) {
  if (!tags.length) return null;

  return (
    <ul className={`blog-tag-list ${className}`.trim()} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="blog-tag">
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
