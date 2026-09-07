import Link from 'next/link';
import { EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react/dist/ssr';
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

          <div className="footer-col footer-col--contact">
            <h3>Contact</h3>
            <a href={`tel:${SITE_CONTACT.phoneTel}`} className="footer-phone">
              <Phone size={18} weight="regular" aria-hidden />
              <span>{SITE_CONTACT.phoneDisplay}</span>
            </a>
            <a href={`mailto:${SITE_CONTACT.email}`} className="footer-contact-line">
              <EnvelopeSimple size={18} weight="regular" aria-hidden />
              <span>{SITE_CONTACT.email}</span>
            </a>
            <Link href="/contact" className="footer-contact-line">
              <MapPin size={18} weight="regular" aria-hidden />
              <span>{SITE_CONTACT.location}</span>
            </Link>
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
