'use client';

import Link from 'next/link';
import { Reveal, RevealText } from '@/components/Reveal';
import { buildConsultationUrl } from '@/lib/consultation';

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
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/images/static.wixstatic.com/11062b_eb3f6c5a72c74c349b14cadcafa930d7f000-21825a8c1f.jpg"
          >
            <source
              src="/assets/media/video.wixstatic.com/file-796864cfbe.mp4"
              type="video/mp4"
            />
          </video>
        </Reveal>
      </div>
    </section>
  );
}
