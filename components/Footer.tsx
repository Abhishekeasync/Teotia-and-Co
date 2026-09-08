import Link from 'next/link';
import { EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react/dist/ssr';
import NewsletterForm from '@/components/NewsletterForm';
import { buildConsultationUrl } from '@/lib/consultation';
import { services } from '@/lib/services';
import { SITE_CONTACT } from '@/lib/site';
import './header-footer.css';

const consultationHref = buildConsultationUrl({ source: 'footer' });

const firmLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/careers', label: 'Careers' },
  { href: '/blog', label: 'Insights' },
  { href: '/contact', label: 'Conatct Us'}
] as const;

const serviceSplit = Math.ceil(services.length / 2);
const serviceColumns = [services.slice(0, serviceSplit), services.slice(serviceSplit)];

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

        <div className="footer-main">
          <div className="footer-identity">
            <p className="footer-brand">
              <Link href="/">TEOTIA &amp; CO.</Link>
            </p>
            <p className="footer-blurb">
              A premier chartered accountancy firm providing expert guidance in taxation, audit,
              corporate finance, and regulatory compliance for businesses across India and
              internationally.
            </p>
            <Link href={consultationHref} className="btn-consult footer-consult">
              Book Consultation
              <span className="btn-consult-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7h8M7 3l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
            <address className="footer-address">
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
            </address>
          </div>

          <div className="footer-navs">
            <nav className="footer-nav footer-nav--services" aria-label="Services">
              <p className="footer-heading">
                <Link href="/services">Services</Link>
              </p>
              <div className="footer-service-cols">
                {serviceColumns.map((column) => (
                  <ul key={column[0]?.slug}>
                    {column.map((service) => (
                      <li key={service.slug}>
                        <Link href={`/services/${service.slug}`}>{service.listTitle}</Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </nav>

            <nav className="footer-nav" aria-label="Firm">
              <p className="footer-heading">Firm</p>
              <ul>
                {firmLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
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
