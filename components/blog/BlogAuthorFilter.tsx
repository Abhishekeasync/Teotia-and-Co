import Link from 'next/link';

type BlogAuthorFilterProps = {
  authorName: string;
};

export function BlogAuthorFilter({ authorName }: BlogAuthorFilterProps) {
  return (
    <div className="blog-filter-banner" role="status">
      <p className="blog-filter-banner-text">
        <span>Showing posts by</span>
        <span className="blog-filter-tag">{authorName}</span>
      </p>
      <Link href="/blog" className="blog-filter-clear">
        Clear filter
      </Link>
    </div>
  );
}
