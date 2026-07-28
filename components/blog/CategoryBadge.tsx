type CategoryBadgeProps = {
  category: string;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.06em] bg-white/95 text-heading ring-1 ring-black/5 shadow-sm backdrop-blur-md">
      {category}
    </span>
  );
}
