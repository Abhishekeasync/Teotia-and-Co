import Link from 'next/link';
import './header-footer.css';

export default function Footer() {
  return (
    <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>TEOTIA &amp; CO.</h4>
            <p>A premier chartered accountancy firm providing expert guidance in taxation, audit, corporate finance, and regulatory compliance for businesses across India and internationally.</p>
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
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Newsletter</h4>
            <p>Stay updated with the latest insights, tax reforms, and business advisory tips from our experts.</p>
            <div className="footer-newsletter">
              <input type="email" placeholder="Your email address" />
              <button>Subscribe</button>
            </div>
            <h4 style={{marginTop: '24px'}}>Contact</h4>
            <p>contact@teotiaandco.com</p>
            <p>+91 98765 43210</p>
            <p>New Delhi, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 TEOTIA & CO. All Rights Reserved.</p>
        </div>
      </footer>
  );
}
