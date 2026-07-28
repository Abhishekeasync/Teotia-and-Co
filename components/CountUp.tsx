'use client';

import { animate, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

type CountUpProps = {
  to: number;
  className?: string;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
};

/** Counts up from 0 when the element scrolls into view */
export default function CountUp({
  to,
  className,
  duration = 1.2,
  suffix = '',
  prefix = '',
  decimals = 0,
}: CountUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    const value = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString('en-US');
    return `${prefix}${value}${suffix}`;
  });
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inView) return;

    const controls = animate(motionValue, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });

    return controls.stop;
  }, [inView, motionValue, to, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (displayRef.current) displayRef.current.textContent = latest;
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <div ref={ref} className={className}>
      <span ref={displayRef}>{`${prefix}${decimals > 0 ? (0).toFixed(decimals) : '0'}${suffix}`}</span>
    </div>
  );
}
