'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CtaBanner from '@/components/CtaBanner';
import ServiceCheckpoints from '@/components/ServiceCheckpoints';
import {
  HeroReveal,
  Reveal,
  RevealText,
  Stagger,
  StaggerItem,
} from '@/components/Reveal';
import { services } from '@/lib/services';
import '../page-styles.css';

export default function ServicesPage() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 0: true });

  const toggleAccordion = (index: number) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <HeroReveal delay={0}>
            <h1 className="services-hero-title">Reliable Accounting Services</h1>
          </HeroReveal>
          <HeroReveal delay={0.08}>
            <p className="about-hero-sub">
              We provide accurate, transparent, and tailored accounting services that simplify your finances, ensure compliance, and support long-term business growth.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.16}>
            <nav className="about-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Services</span>
            </nav>
          </HeroReveal>
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="section">
        <div className="services-page-layout">
          <div className="services-header">
            <RevealText as="h2">
              Core Accounting Services To<br />Simplify Your Finances
            </RevealText>
          </div>

          <div className="services-page-body">
            <div className="services-accordion services-page-list">
              <Stagger className="services-list">
                {services.map((service, index) => {
                  const isOpen = !!openItems[index];
                  return (
                    <StaggerItem className="service-accordion-item" key={service.slug}>
                      <div
                        className="service-accordion-header"
                        onClick={() => toggleAccordion(index)}
                      >
                        <h3>
                          [{String(index + 1).padStart(2, '0')}] {service.title}
                        </h3>
                        <button className="toggle-btn" type="button" aria-label={`Toggle ${service.title}`}>
                          {isOpen ? '−' : '+'}
                        </button>
                      </div>
                      <div className={`service-accordion-content${isOpen ? ' active' : ''}`}>
                        <p className="service-description">{service.shortDescription}</p>
                        <ServiceCheckpoints
                          items={service.features}
                          active={isOpen}
                          className="service-features service-features--green-checks"
                        />
                        <Link href={`/services/${service.slug}`} className="btn-explore">
                          Explore Service Details
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="M13 6l6 6-6 6" />
                          </svg>
                        </Link>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>

            <Reveal className="services-page-image">
              <Image
                src="/assets/images/services-consult-support.png"
                alt="Man writing on paper with calculator at wooden table"
                width={567}
                height={815}
                priority
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHY TRUST US */}
      <section className="section section-gray">
        <div className="trust">
          <RevealText as="h2">Why Businesses Trust Us With Their Finances</RevealText>
          <RevealText as="p" className="trust-sub" delay={0.08}>
            Reliable, accurate, and expert accounting solutions that make your business run smoothly.
          </RevealText>
          <Stagger className="trust-grid">
            <StaggerItem className="trust-card">
              <div className="trust-icon">
                <Image
                  src="/assets/images/static.wixstatic.com/fb4679_bfd7e9f5379042f1b9bdbe57ee7504c0-063527ce46.svg"
                  alt=""
                  width={59}
                  height={57}
                />
              </div>
              <h3>Proven Success</h3>
              <ul className="trust-bullets">
                <li>99% Client Satisfaction Rate</li>
                <li>Consistently Accurate for Results this.</li>
              </ul>
            </StaggerItem>
            <StaggerItem className="trust-card">
              <div className="trust-icon">
                <Image
                  src="/assets/images/static.wixstatic.com/fb4679_21b8b39d9bab4c24abb9223f82b1466f-7eef7ba366.svg"
                  alt=""
                  width={68}
                  height={68}
                />
              </div>
              <h3>Expert Guidance</h3>
              <ul className="trust-bullets">
                <li>10+ Years of CPA Experience</li>
                <li>Expert Advice Tailored for Business.</li>
              </ul>
            </StaggerItem>
            <StaggerItem className="trust-card">
              <div className="trust-icon">
                <Image
                  src="/assets/images/static.wixstatic.com/fb4679_14fee24df05b43439f902b67dd58a426-76ccfa920d.svg"
                  alt=""
                  width={68}
                  height={68}
                />
              </div>
              <h3>Timely Solutions</h3>
              <ul className="trust-bullets">
                <li>100% On-Time Filing &amp; Reporting</li>
                <li>Never miss a deadline, compliant.</li>
              </ul>
            </StaggerItem>
            <StaggerItem className="trust-card">
              <div className="trust-icon">
                <Image
                  src="/assets/images/static.wixstatic.com/fb4679_c98be4ef1e154770b674da71b79e6054-9989048e1e.svg"
                  alt=""
                  width={68}
                  height={68}
                />
              </div>
              <h3>Fully Transparent</h3>
              <ul className="trust-bullets">
                <li>Clear &amp; Simple Financial Insights</li>
                <li>No hidden surprises, full clarity.</li>
              </ul>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
