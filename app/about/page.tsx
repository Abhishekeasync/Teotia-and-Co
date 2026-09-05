import Image from 'next/image';
import Link from 'next/link';
import CtaBanner from '@/components/CtaBanner';
import {
  HeroReveal,
  Reveal,
  RevealText,
  Stagger,
  StaggerItem,
} from '@/components/Reveal';
import VisionMission from '@/components/VisionMission';
import { teamMembers } from '@/lib/team';
import '../page-styles.css';

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <HeroReveal delay={0}>
            <h1>About Us</h1>
          </HeroReveal>
          <HeroReveal delay={0.08}>
            <p className="about-hero-sub">
              A Chartered Accountants firm committed to comprehensive solutions in accounting, auditing, taxation, financial advisory, corporate compliance, and business consulting.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.16}>
            <nav className="about-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">About Us</span>
            </nav>
          </HeroReveal>
        </div>
      </section>

      {/* ABOUT INTRO */}
      <section className="section about-section">
        <div className="about-header-row">
          <RevealText as="h2" className="about-main-title">
            Comprehensive solutions in accounting, auditing, taxation, and advisory.
          </RevealText>
        </div>

        <div className="about-grid-intro">
          <Reveal className="about-col-text">
            <p className="about-description">
              Teotia &amp; Co. is a Chartered Accountants firm committed to providing comprehensive solutions in accounting, auditing, taxation, financial advisory, corporate compliance, and business consulting services. With a strong focus on professionalism, integrity, and client satisfaction, the firm serves businesses, startups, entrepreneurs, professionals, and investors across diverse industries.
            </p>
            <p className="about-description">
              Our team combines technical expertise with practical business understanding to deliver strategic and value-driven solutions in statutory audits, internal audits, direct and indirect taxation, financial reporting, corporate advisory, regulatory compliance, business structuring, and financial management. We assist our clients in navigating complex financial and regulatory environments while ensuring compliance, efficiency, and sustainable growth.
            </p>
          </Reveal>

          <Reveal className="about-col-img">
            <Image
              src="/assets/images/static.wixstatic.com/image-20249-383eae270f.png"
              alt="Our team collaborating in the office"
              width={458}
              height={524}
              className="team-img-rounded"
            />
          </Reveal>
        </div>
      </section>

      <VisionMission />

      {/* TEAM */}
      <section className="section section-gray">
        <div className="team team-meet">
          <Reveal className="team-header">
            <h2>Connect With Our Leadership</h2>
            <p className="team-sub">
              Dedicated professionals providing reliable, transparent, and growth-focused accounting solutions.
            </p>
          </Reveal>
          <Stagger className="team-grid team-grid-five">
            {teamMembers.map((member) => (
              <StaggerItem className="team-card" key={member.name}>
                <div className="team-card-photo">
                  <Image
                    src={member.src}
                    alt={member.name}
                    fill
                    quality={100}
                    sizes="(max-width: 480px) 92vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                  />
                </div>
                <div className="team-card-body">
                  <h3>{member.name}</h3>
                  <div className="team-card-meta">
                    <span className="role">{member.role}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
