'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Reveal, RevealText } from '@/components/Reveal';
import { buildConsultationUrl } from '@/lib/consultation';
import { CONSULTATION_HOURS } from '@/lib/site';

type ConsultationHoursProps = {
  ctaHref?: string;
};

export default function ConsultationHours({
  ctaHref = buildConsultationUrl({ source: 'home-hours' }),
}: ConsultationHoursProps) {
  return (
    <section className="section section-gray" id="consultation-hours">
      <div className="available">
        <Reveal className="available-header">
          <RevealText as="h2">We're Available All Week for Flexible Consultation Support</RevealText>
          <RevealText as="p" className="available-sub" delay={0.08}>
            Get expert financial guidance at the time that works best for you.
          </RevealText>
        </Reveal>

        <div className="available-body">
          <Reveal className="available-image">
            <Image
              src="/assets/images/static.wixstatic.com/image-20256-4404a5e778.png"
              alt="Team collaborating during a consultation"
              width={640}
              height={520}
            />
          </Reveal>

          <Reveal className="available-card">
            <div className="available-card-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2.5c-3.87 0-7 3.05-7 6.8 0 4.85 5.55 10.58 6.55 11.57a.7.7 0 0 0 1 0C13.45 19.88 19 14.15 19 9.3c0-3.75-3.13-6.8-7-6.8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="9.3" r="2.4" fill="currentColor" />
              </svg>
            </div>
            <h3>Consultation Hours</h3>
            <p className="available-card-desc">
              We're available throughout the week and ready to assist with flexible consultation times.
            </p>
            <div className="available-hours">
              {CONSULTATION_HOURS.map((row) => (
                <div className="available-hours-row" key={row.day}>
                  <span className="day">{row.day}</span>
                  <span className="time">{row.time}</span>
                </div>
              ))}
            </div>
            <Link href={ctaHref} className="btn-available">
              Get Appointment
              <span className="btn-available-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
