'use client';

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import ServiceCheckpoints from '@/components/ServiceCheckpoints';

type Props = {
  items: string[];
};

/** Scroll-triggered staggered checks for service detail pages */
export default function ServiceDetailChecks({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <div ref={ref}>
      <ServiceCheckpoints
        items={items}
        active={inView}
        className="service-detail-highlights"
        variant="simple"
      />
    </div>
  );
}
