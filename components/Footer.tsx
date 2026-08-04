import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import { buildConsultationUrl } from '@/lib/consultation';
import { SITE_CONTACT } from '@/lib/site';
import './header-footer.css';

const consultationHref = buildConsultationUrl({ source: 'footer' });

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>
            <Link href="/">TEOTIA &amp; CO.</Link>
          </h4>
          <p>
            A premier chartered accountancy firm providing expert guidance in taxation, audit,
            corporate finance, and regulatory compliance for businesses across India and
            internationally.
          </p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <Link href="/services/tax-planning-filing">Tax Planning &amp; Filing</Link>
          <Link href="/services/business-accounting">Business Accounting</Link>
          <Link href="/services/payroll-management">Payroll Management</Link>
          <Link href="/services/audit-assurance">Audit &amp; Assurance</Link>
          <Link href="/services/financial-advisory">Financial Advisory</Link>
          <Link href="/services/management-consulting">Management Consulting</Link>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link href="/about">About Us</Link>
          <Link href="/services">Services</Link>
          <Link href="/blog">Blog</Link>
          <Link href={consultationHref}>Book Consultation</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
        </div>
        <div className="footer-col">
          <h4>Newsletter</h4>
          <p>
            Stay updated with the latest insights, tax reforms, and business advisory tips from
            our experts.
          </p>
          <NewsletterForm source="footer" />
          <h4 style={{ marginTop: '24px' }}>Contact</h4>
          <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
          <a href={`tel:${SITE_CONTACT.phoneTel}`}>{SITE_CONTACT.phoneDisplay}</a>
          <Link href="/contact">{SITE_CONTACT.location}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 TEOTIA &amp; CO. All Rights Reserved.</p>
        <div className="footer-legal-links">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
