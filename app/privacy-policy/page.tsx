import Link from 'next/link';
import { SITE_CONTACT } from '@/lib/site';
import '../page-styles.css';

export const metadata = {
  title: 'Privacy Policy | TEOTIA & CO.',
  description:
    'Learn how TEOTIA & CO. collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Privacy Policy</h1>
          <p className="about-hero-sub">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and
            protect your personal information when you visit or use our website.
          </p>
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Privacy Policy</span>
          </nav>
        </div>
      </section>

      <section className="section legal-section">
        <div className="legal-content">
          <p className="legal-updated">Last updated: August 4, 2026</p>

          <h2>Information We Collect</h2>
          <p>
            We may collect personal information such as your name, email address, phone number, and
            payment details when you contact us or make a purchase.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            To provide and improve our services, communicate with you, process transactions, and
            send promotional materials (only if you opt-in).
          </p>

          <h2>Data Security</h2>
          <p>
            We implement reasonable security measures to protect your data from unauthorized access,
            alteration, or disclosure.
          </p>

          <h2>Cookies</h2>
          <p>Our website uses cookies to enhance user experience and analyze traffic.</p>

          <h2>Third-Party Sharing</h2>
          <p>
            We do not sell or rent your personal information to third parties. We may share
            information with trusted service providers to help operate our business.
          </p>

          <h2>Your Rights</h2>
          <p>
            You can request access to your data or ask us to delete it by contacting us at{' '}
            <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>.
          </p>

          <h2>Policy Updates</h2>
          <p>
            We may update this policy occasionally. Changes will be posted on this page with an
            updated date.
          </p>
        </div>
      </section>
    </>
  );
}
