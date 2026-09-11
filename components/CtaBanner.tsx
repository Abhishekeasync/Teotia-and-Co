'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal, RevealText } from '@/components/Reveal';
import { buildConsultationUrl } from '@/lib/consultation';

const CTA_VIDEO_SRC = '/assets/media/video.wixstatic.com/file-796864cfbe.mp4';
const CTA_POSTER_SRC =
  '/assets/images/static.wixstatic.com/11062b_eb3f6c5a72c74c349b14cadcafa930d7f000-21825a8c1f.jpg';

type CtaBannerProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
};

export default function CtaBanner({
  title = 'Start Your Free Consultation Today',
  description = 'One conversation with our experts could save your business thousands. Get personalized financial guidance now.',
  buttonText = 'Book Consultation',
  buttonHref = buildConsultationUrl({ source: 'cta-banner' }),
}: CtaBannerProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncViewport = () => setIsMobileViewport(mobileQuery.matches);
    const syncMotion = () => setPrefersReducedMotion(motionQuery.matches);

    syncViewport();
    syncMotion();

    if (mobileQuery.matches || motionQuery.matches) {
      return;
    }

    const node = mediaRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(node);

    mobileQuery.addEventListener('change', syncViewport);
    motionQuery.addEventListener('change', syncMotion);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener('change', syncViewport);
      motionQuery.removeEventListener('change', syncMotion);
    };
  }, []);

  const showVideo = shouldLoadVideo && !isMobileViewport && !prefersReducedMotion;

  return (
    <section className="cta-banner cta-banner--split">
      <div className="cta-banner-inner">
        <div className="cta-banner-content">
          <RevealText as="h2">{title}</RevealText>
          <RevealText as="p" delay={0.08}>
            {description}
          </RevealText>
          <Reveal delay={0.16}>
            <Link href={buttonHref} className="btn-cta-pill">
              {buttonText}
              <span className="btn-cta-pill-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                  <path
                    d="M5 12h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </Reveal>
        </div>
        <Reveal className="cta-banner-media" delay={0.12}>
          <div ref={mediaRef} className="cta-banner-media-frame">
            {showVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                poster={CTA_POSTER_SRC}
              >
                <source src={CTA_VIDEO_SRC} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={CTA_POSTER_SRC}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 420px"
                loading="lazy"
                className="cta-banner-poster"
              />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
