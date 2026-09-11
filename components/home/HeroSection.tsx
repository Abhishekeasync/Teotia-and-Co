import Image from 'next/image';
import Link from 'next/link';
import { buildConsultationUrl } from '@/lib/consultation';

const heroConsultationHref = buildConsultationUrl({ source: 'hero' });

export function HeroSection() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg" aria-hidden="true">
        <Image
          src="/assets/images/bc/Hero-section-bg.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={75}
          className="hero-bg-image"
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-reveal" style={{ animationDelay: '0s' }}>
          <h1>Your Strategic Partner in Business, Tax &amp; Regulatory Excellence.</h1>
        </div>
        <div className="hero-reveal" style={{ animationDelay: '0.1s' }}>
          <p>
            Supporting businesses with trusted expertise in taxation, compliance, financial
            advisory, business structuring, and transaction support to drive sustainable growth.
          </p>
        </div>
        <div className="hero-reveal" style={{ animationDelay: '0.2s' }}>
          <Link href={heroConsultationHref} className="btn-hero">
            Get a Free Consultation
            <span className="btn-hero-icon" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
