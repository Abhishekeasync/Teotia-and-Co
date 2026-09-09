import Link from 'next/link';
import { SchemaOrg } from '@/components/SchemaOrg';
import {
  buildLegalPageSchema,
  LEGAL_LAST_UPDATED_DISPLAY,
} from '@/lib/legal';
import { SITE_CONTACT } from '@/lib/site';
import '../page-styles.css';

const PAGE_DESCRIPTION =
  'Terms of Service for the TEOTIA & CO. website covering acceptable use, intellectual property, professional disclaimers, and governing law for visitors and online enquiries.';

export default function TermsOfServicePage() {
  return (
    <>
      <SchemaOrg
        schema={buildLegalPageSchema({
          name: 'Terms of Service',
          path: '/terms-of-service',
          description: PAGE_DESCRIPTION,
        })}
      />

      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Terms of Service</h1>
          <p className="about-hero-sub">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
            TEOTIA &amp; CO. website at{' '}
            <a href="https://www.teotiaco.com">teotiaco.com</a>. Please read them carefully before
            using the site.
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
          <p className="legal-updated">Last updated: {LEGAL_LAST_UPDATED_DISPLAY}</p>

          <h2>1. Agreement to These Terms</h2>
          <p>
            By accessing or using our website, submitting an enquiry, subscribing to our newsletter,
            or applying for a position, you agree to these Terms and our{' '}
            <Link href="/privacy-policy">Privacy Policy</Link>. If you do not agree, please do not
            use the website.
          </p>

          <h2>2. About TEOTIA &amp; CO.</h2>
          <p>
            TEOTIA &amp; CO. is a chartered accountancy and professional advisory firm based in
            Noida, Uttar Pradesh, India. Through this website we provide general information about
            our services in taxation, audit, corporate finance, regulatory compliance, and related
            advisory areas.
          </p>

          <h2>3. Website Use</h2>
          <p>You agree to use this website only for lawful purposes. You must not:</p>
          <ul>
            <li>Attempt to gain unauthorised access to our systems, accounts, or data.</li>
            <li>Introduce malware, automated scraping, or activity that disrupts site performance.</li>
            <li>Misrepresent your identity or submit false or misleading information.</li>
            <li>Use content from this site in a way that infringes our or third-party rights.</li>
          </ul>
          <p>
            We may suspend or restrict access where we reasonably believe these Terms have been
            violated or where necessary to protect the website, our users, or our firm.
          </p>

          <h2>4. No Professional-Client Relationship from Website Use Alone</h2>
          <p>
            Browsing this website, reading articles, or submitting a general enquiry does{' '}
            <strong>not</strong> create a chartered accountant–client, advisor–client, or fiduciary
            relationship. A professional engagement with TEOTIA &amp; CO. begins only after mutual
            agreement on scope, fees, and terms — typically documented in an engagement letter,
            proposal, or written contract.
          </p>

          <h2>5. Information on This Website Is Not Advice</h2>
          <p>
            Content on teotiaco.com — including service descriptions, blog posts, insights, and
            downloadable materials — is provided for general information only. It is not a
            substitute for professional advice tailored to your specific facts, jurisdiction, or
            circumstances.
          </p>
          <p>
            Tax, audit, regulatory, and corporate matters change frequently. You should not act or
            refrain from acting based solely on website content without obtaining qualified
            professional advice. TEOTIA &amp; CO. accepts no responsibility for decisions made
            without a formal engagement.
          </p>

          <h2>6. Enquiries, Consultations, and Services</h2>
          <p>
            When you submit a contact or consultation request, you represent that the information
            provided is accurate to the best of your knowledge. Submitting a form does not guarantee
            that we will accept an engagement or respond within a particular timeframe, although we
            aim to respond promptly during business hours.
          </p>
          <p>
            Fees, deliverables, confidentiality obligations, and professional responsibilities for
            paid services are governed by separate written terms agreed with you — not by these
            website Terms.
          </p>

          <h2>7. Newsletter and Marketing Communications</h2>
          <p>
            If you subscribe to our newsletter, you consent to receive emails about firm updates,
            tax and regulatory insights, and related content. You may unsubscribe at any time using
            the link in our emails or via our <Link href="/unsubscribe">unsubscribe page</Link>.
            Please see our Privacy Policy for how we handle subscriber data.
          </p>

          <h2>8. Career Applications</h2>
          <p>
            Job listings on our <Link href="/careers">careers pages</Link> describe opportunities
            available at the time of posting. Submitting an application does not create an employment
            contract. We review applications in good faith but are not obligated to interview or
            hire any candidate. Application materials must be truthful and must not infringe
            third-party rights.
          </p>

          <h2>9. Intellectual Property</h2>
          <p>
            Unless otherwise stated, all content on this website — including text, graphics, logos,
            layouts, and downloadable materials — is owned by or licensed to TEOTIA &amp; CO. and is
            protected by applicable intellectual property laws.
          </p>
          <p>
            You may view and print pages for personal, non-commercial reference. You may not copy,
            reproduce, distribute, modify, or create derivative works without our prior written
            consent, except as permitted by law.
          </p>

          <h2>10. Third-Party Links</h2>
          <p>
            Our website may link to external websites or resources for convenience. We do not control
            and are not responsible for the content, privacy practices, or availability of third-party
            sites. Accessing linked sites is at your own risk.
          </p>

          <h2>11. Disclaimer of Warranties</h2>
          <p>
            This website and its content are provided on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis. To the fullest extent permitted by law, we disclaim all
            warranties, express or implied, including warranties of accuracy, completeness,
            non-infringement, or fitness for a particular purpose.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, TEOTIA &amp; CO. and its partners,
            employees, and affiliates shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of — or inability to use — this
            website, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            Our aggregate liability for claims relating solely to website use (and not to a separate
            professional engagement) shall not exceed INR 10,000 or the amount you paid us directly
            for website-related services in the twelve months preceding the claim, whichever is
            greater, except where liability cannot be limited under applicable law.
          </p>

          <h2>13. Indemnity</h2>
          <p>
            You agree to indemnify and hold harmless TEOTIA &amp; CO. from claims, losses, or
            expenses (including reasonable legal fees) arising from your misuse of the website,
            violation of these Terms, or infringement of any third-party rights through information
            you submit.
          </p>

          <h2>14. Governing Law and Jurisdiction</h2>
          <p>
            These Terms are governed by the laws of India. Subject to applicable law, courts at
            Noida, Uttar Pradesh shall have exclusive jurisdiction over disputes arising from or
            relating to use of this website, without prejudice to mandatory consumer or statutory
            rights.
          </p>

          <h2>15. Changes to These Terms</h2>
          <p>
            We may revise these Terms at any time by posting an updated version on this page with a
            revised &ldquo;Last updated&rdquo; date. Continued use of the website after changes are
            posted constitutes acceptance of the revised Terms.
          </p>

          <h2>16. Contact</h2>
          <p>For questions about these Terms, contact us at:</p>
          <ul>
            <li>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
            </li>
            <li>
              <strong>Phone:</strong>{' '}
              <a href={`tel:${SITE_CONTACT.phoneTel}`}>{SITE_CONTACT.phoneDisplay}</a>
            </li>
            <li>
              <strong>Address:</strong> TEOTIA &amp; CO., {SITE_CONTACT.location}
            </li>
          </ul>
          <p>
            For data protection matters, please refer to our{' '}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
