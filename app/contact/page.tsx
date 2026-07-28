'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  HeroReveal,
  Reveal,
  RevealText,
  Stagger,
  StaggerItem,
} from '@/components/Reveal';
import '../page-styles.css';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you shortly.');
    e.currentTarget.reset();
  };

  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <HeroReveal delay={0}>
            <h1 className="contact-hero-title">Start Your Financial Journey</h1>
          </HeroReveal>
          <HeroReveal delay={0.08}>
            <p className="about-hero-sub">
              Have questions about accounting, tax planning, or business finances? TEOTIA &amp; CO. is here to provide clear guidance and reliable support.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.16}>
            <nav className="about-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Contact</span>
            </nav>
          </HeroReveal>
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section className="section">
        <div className="contact-intro">
          <RevealText as="h2">Get in Touch With TEOTIA &amp; CO.</RevealText>
          <RevealText as="p" delay={0.08}>
            Get in touch with TEOTIA &amp; CO. for clear, reliable financial support.
          </RevealText>
        </div>

        <Stagger className="contact-cards">
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3>Email</h3>
            <p>contact@teotiaandco.com</p>
          </StaggerItem>
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3>Phone Number</h3>
            <p>+91 98765 43210</p>
          </StaggerItem>
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3>Location</h3>
            <p>New Delhi, India</p>
          </StaggerItem>
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Working Hours</h3>
            <p>Mon - Sat : 9.00 - 5.00</p>
          </StaggerItem>
        </Stagger>
      </section>

      {/* CONTACT FORM */}
      <section className="section section-gray">
        <div className="contact-form-layout">
          <Reveal className="contact-form-image">
            <Image
              src="/assets/images/static.wixstatic.com/download-2-jfif.jpg"
              alt="Professional handshake during a business meeting"
              width={600}
              height={800}
              priority
            />
          </Reveal>

          <Reveal>
            <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your full name" required />
            </div>
            <div className="form-group">
              <label htmlFor="number">Number</label>
              <input type="tel" id="number" name="number" placeholder="Your phone number" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Your email address" required />
            </div>
            <div className="form-group">
              <label htmlFor="services">Services</label>
              <select id="services" name="services" defaultValue="" required>
                <option value="" disabled>
                  Services
                </option>
                <option value="tax">Tax Planning &amp; Filing</option>
                <option value="accounting">Business Accounting</option>
                <option value="payroll">Payroll Management</option>
                <option value="audit">Audit &amp; Assurance</option>
                <option value="advisory">Financial Advisory</option>
                <option value="consulting">Management Consulting</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" placeholder="Tell us about your needs..." required />
            </div>
            <label className="form-checkbox full-width">
              <input type="checkbox" name="agree" required />
              <span>I agree to be contacted by TEOTIA &amp; CO.</span>
            </label>
            <div className="form-submit">
              <button type="submit" className="btn-green">
                Send Message
              </button>
            </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
