'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';

export type BlogGalleryImage = {
  id?: number;
  imageUrl: string;
  displayOrder?: number;
};

type BlogHeroCarouselProps = {
  featuredImageUrl?: string | null;
  galleryImages?: BlogGalleryImage[];
  title: string;
  autoPlayMs?: number;
};

function buildSlides(
  featuredImageUrl: string | null | undefined,
  galleryImages: BlogGalleryImage[]
): string[] {
  const slides: string[] = [];
  const seen = new Set<string>();

  const featured = featuredImageUrl?.trim();
  if (featured) {
    slides.push(featured);
    seen.add(featured);
  }

  const sortedGallery = [...galleryImages].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  for (const image of sortedGallery) {
    const url = image.imageUrl?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    slides.push(url);
  }

  return slides;
}

export function BlogHeroCarousel({
  featuredImageUrl,
  galleryImages = [],
  title,
  autoPlayMs = 4500,
}: BlogHeroCarouselProps) {
  const slides = useMemo(
    () => buildSlides(featuredImageUrl, galleryImages),
    [featuredImageUrl, galleryImages]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [slides.length, reduceMotion, autoPlayMs]);

  if (slides.length === 0) return null;

  const hasMultipleSlides = slides.length > 1;

  return (
    <div
      className="blog-hero-carousel"
      style={{ '--carousel-duration': `${autoPlayMs}ms` } as CSSProperties}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} images`}
    >
      <div
        className="blog-hero-carousel-viewport"
        aria-live={hasMultipleSlides ? 'polite' : undefined}
      >
        <div
          className="blog-hero-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((src, index) => (
            <figure
              key={`${src}-${index}`}
              className={`blog-hero-carousel-slide${
                index === activeIndex ? ' is-active' : ''
              }`}
              aria-hidden={index !== activeIndex}
            >
              {src.startsWith('blob:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={
                    slides.length === 1
                      ? title
                      : `${title} — image ${index + 1} of ${slides.length}`
                  }
                  className="blog-hero-carousel-image"
                />
              ) : (
                <Image
                  src={src}
                  alt={
                    slides.length === 1
                      ? title
                      : `${title} — image ${index + 1} of ${slides.length}`
                  }
                  width={980}
                  height={552}
                  sizes="(max-width: 980px) 100vw, 980px"
                  className="blog-hero-carousel-image"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              )}
            </figure>
          ))}
        </div>
      </div>

      {hasMultipleSlides && (
        <>
          <div className="blog-hero-carousel-gradient" aria-hidden />
          <div
            className="blog-hero-carousel-indicators"
            aria-label={`Image ${activeIndex + 1} of ${slides.length}`}
          >
            <div className="blog-hero-carousel-dots" role="presentation">
              {slides.map((src, index) => {
                const state =
                  index === activeIndex
                    ? 'is-active'
                    : index < activeIndex
                      ? 'is-passed'
                      : 'is-upcoming';

                return (
                  <span
                    key={`${src}-${index}`}
                    className={`blog-hero-carousel-dot ${state}`}
                    aria-hidden
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
