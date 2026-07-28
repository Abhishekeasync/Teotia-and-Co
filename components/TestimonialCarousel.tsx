'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  alt: string;
  image: string;
};

const GAP = 24;
const INTERVAL_MS = 3200;
const SLIDE_MS = 700;

type Props = {
  items: Testimonial[];
};

function getCardWidth(viewportWidth: number) {
  if (viewportWidth < 640) return Math.min(300, viewportWidth * 0.78);
  if (viewportWidth < 900) return 300;
  return 340;
}

export default function TestimonialCarousel({ items }: Props) {
  const count = items.length;
  const loop = [...items, ...items, ...items];
  const startIndex = count;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(1068);
  const [index, setIndex] = useState(startIndex);
  const [instant, setInstant] = useState(false);
  const x = useMotionValue(0);
  const hasMounted = useRef(false);

  const cardWidth = getCardWidth(viewportWidth);
  const step = cardWidth + GAP;

  // Keep the active (center) card in the middle of the viewport
  const targetX = viewportWidth / 2 - cardWidth / 2 - (index + 1) * step;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      setViewportWidth(width);
      if (!hasMounted.current) {
        const w = getCardWidth(width);
        const s = w + GAP;
        x.set(width / 2 - w / 2 - (startIndex + 1) * s);
        hasMounted.current = true;
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [x, startIndex]);

  useEffect(() => {
    if (!hasMounted.current) return;
    const controls = animate(x, targetX, {
      duration: instant ? 0 : SLIDE_MS / 1000,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [targetX, instant, x]);

  useEffect(() => {
    const id = setInterval(() => {
      setInstant(false);
      setIndex((prev) => prev + 1);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (index < count * 2) return;
    const timer = setTimeout(() => {
      setInstant(true);
      setIndex((prev) => prev - count);
    }, SLIDE_MS + 40);
    return () => clearTimeout(timer);
  }, [index, count]);

  return (
    <div
      ref={viewportRef}
      className="testimonials-viewport"
      aria-roledescription="carousel"
    >
      <motion.div className="testimonials-track" style={{ x, gap: GAP }}>
        {loop.map((item, i) => {
          const offsetFromCenter = i - (index + 1);
          const isCenter = offsetFromCenter === 0;
          const isNear = Math.abs(offsetFromCenter) <= 1;

          return (
            <motion.article
              key={`${item.name}-${i}`}
              className={`testimonial-card${isCenter ? ' testimonial-card--center' : ''}`}
              animate={{
                scale: isCenter ? 1.1 : 0.88,
                opacity: isNear ? (isCenter ? 1 : 0.65) : 0.3,
              }}
              transition={{
                duration: instant ? 0 : 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                width: cardWidth,
                minWidth: cardWidth,
                zIndex: isCenter ? 2 : 1,
              }}
              aria-hidden={!isNear}
            >
              <p className="quote">{item.quote}</p>
              <div className="testimonial-author">
                <Image
                  src={item.image}
                  alt={item.alt}
                  className="testimonial-avatar"
                  width={48}
                  height={48}
                />
                <div className="testimonial-info">
                  <div className="name">{item.name}</div>
                  <div className="role">{item.role}</div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
