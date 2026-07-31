import Link from 'next/link';

type BlogEmptyStateProps = {
  title?: string;
  message?: string;
  showClearFilter?: boolean;
};

export function BlogEmptyState({
  title = 'Insights coming soon',
  message = "We're preparing expert articles on tax, accounting, and financial planning. Check back shortly for new guidance.",
  showClearFilter = false,
}: BlogEmptyStateProps) {
  return (
    <div
      className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-8 py-16 lg:py-20 text-center"
      role="status"
    >
      <p className="font-display text-xl lg:text-2xl font-bold text-heading mb-3">
        {title}
      </p>
      <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      {showClearFilter && (
        <Link href="/blog" className="blog-filter-clear blog-filter-clear--button">
          View all posts
        </Link>
      )}
    </div>
  );
}
