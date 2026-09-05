import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import { buildConsultationUrl } from '@/lib/consultation';
import { SITE_CONTACT } from '@/lib/site';
import './header-footer.css';

const consultationHref = buildConsultationUrl({ source: 'footer' });

const firmLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/careers', label: 'Careers' },
  { href: '/blog', label: 'Insights' },
  { href: consultationHref, label: 'Book Consultation' },
  { href: '/contact', label: 'Contact' },
] as const;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-shell">
        <section className="footer-subscribe" aria-labelledby="footer-subscribe-heading">
          <div className="footer-subscribe-copy">
            <h2 id="footer-subscribe-heading">Insights in your inbox</h2>
            <p>Tax reforms and advisory notes from our experts.</p>
          </div>
          <NewsletterForm source="footer" />
        </section>

        <div className="footer-grid">
          <div className="footer-col footer-col--brand">
            <h3>
              <Link href="/">TEOTIA &amp; CO.</Link>
            </h3>
            <p>
              A premier chartered accountancy firm providing expert guidance in taxation, audit,
              corporate finance, and regulatory compliance for businesses across India and
              internationally.
            </p>
          </div>

          <nav className="footer-col" aria-label="Firm">
            <h3>Firm</h3>
            {firmLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="footer-col">
            <h3>Contact</h3>
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
      </div>
    </footer>
  );
}
