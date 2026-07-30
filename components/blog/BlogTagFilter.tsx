import Link from 'next/link';

type BlogTagFilterProps = {
  tag: string;
};

export function BlogTagFilter({ tag }: BlogTagFilterProps) {
  return (
    <div className="blog-filter-banner" role="status">
      <p className="blog-filter-banner-text">
        <span>Showing posts tagged</span>
        <span className="blog-filter-tag">#{tag}</span>
      </p>
      <Link href="/blog" className="blog-filter-clear">
        Clear filter
      </Link>
    </div>
  );
}
