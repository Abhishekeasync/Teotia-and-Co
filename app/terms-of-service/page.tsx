import Link from 'next/link';
import '../page-styles.css';

export const metadata = {
  title: 'Terms of Service | TEOTIA & CO.',
  description:
    'Terms of Service for using the TEOTIA & CO. website and professional services.',
};

export default function TermsOfServicePage() {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Terms of Service</h1>
          <p className="about-hero-sub">
            Welcome to TEOTIA &amp; CO. By using our website and services, you agree to the
            following terms.
          </p>
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Terms of Service</span>
          </nav>
        </div>
      </section>

      <section className="section legal-section">
        <div className="legal-content">
          <p className="legal-updated">Last updated: August 4, 2026</p>

          <h2>Use of Website</h2>
          <p>
            You agree to use the site for lawful purposes only and not to engage in activities that
            may harm the site or others.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content, logos, and materials on this site are owned by or licensed to TEOTIA
            &amp; CO. and may not be used without permission.
          </p>

          <h2>Product/Service Information</h2>
          <p>
            We strive for accuracy but do not guarantee completeness or error-free content.
          </p>

          <h2>User Accounts</h2>
          <p>
            If applicable, you are responsible for maintaining the confidentiality of your account
            and password.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            TEOTIA &amp; CO. is not liable for any direct or indirect damages arising from the use
            of this site.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of India, where TEOTIA &amp; CO. is registered.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these terms at any time without prior notice. Continued use constitutes
            acceptance of changes.
          </p>
        </div>
      </section>
    </>
  );
}
