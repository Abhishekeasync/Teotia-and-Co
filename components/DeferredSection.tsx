'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type DeferredSectionProps = {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  className?: string;
};

export function DeferredSection({
  children,
  minHeight = 240,
  rootMargin = '240px 0px',
  className,
}: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={isVisible ? undefined : { minHeight }}
      aria-hidden={!isVisible}
    >
      {isVisible ? children : null}
    </div>
  );
}
