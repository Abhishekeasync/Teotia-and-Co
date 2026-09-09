import Link from 'next/link';
import { SchemaOrg } from '@/components/SchemaOrg';
import {
  buildLegalPageSchema,
  LEGAL_LAST_UPDATED_DISPLAY,
} from '@/lib/legal';
import { SITE_CONTACT } from '@/lib/site';
import '../page-styles.css';

const PAGE_DESCRIPTION =
  'Privacy Policy for TEOTIA & CO. explaining how personal data is collected, used, and protected on teotiaco.com in accordance with India’s Digital Personal Data Protection Act, 2023.';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SchemaOrg
        schema={buildLegalPageSchema({
          name: 'Privacy Policy',
          path: '/privacy-policy',
          description: PAGE_DESCRIPTION,
        })}
      />

      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Privacy Policy</h1>
          <p className="about-hero-sub">
            This Privacy Policy explains how TEOTIA &amp; CO. (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) collects, uses, stores, and protects personal data when you visit{' '}
            <a href="https://www.teotiaco.com">teotiaco.com</a> or interact with us through the
            channels described below.
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
          <p className="legal-updated">Last updated: {LEGAL_LAST_UPDATED_DISPLAY}</p>

          <h2>1. Scope</h2>
          <p>
            This policy applies to personal data processed through our public website, including
            contact and consultation enquiries, newsletter subscriptions, and career applications. It
            does not replace engagement letters, confidentiality terms, or data-handling provisions
            agreed when you become a client of our chartered accountancy and advisory services.
          </p>
          <p>
            By using our website, you acknowledge this policy. Where consent is required under
            applicable law — for example, for marketing communications — we seek it separately and
            clearly.
          </p>

          <h2>2. Data We Collect</h2>
          <p>Depending on how you interact with us, we may collect the following categories of data:</p>
          <ul>
            <li>
              <strong>Contact and enquiry data:</strong> name, email address, phone number, service
              type, subject, and message content submitted through our{' '}
              <Link href="/contact">contact form</Link>.
            </li>
            <li>
              <strong>Newsletter data:</strong> email address (and, where provided, a display name)
              when you subscribe to insights and updates via our website footer or other signup
              forms.
            </li>
            <li>
              <strong>Career application data:</strong> name, email, phone number, current location,
              years of experience, and résumé/CV files submitted when you apply for a role listed on
              our <Link href="/careers">careers pages</Link>.
            </li>
            <li>
              <strong>Technical and usage data:</strong> IP address, browser type, device
              information, referring URLs, pages viewed, and timestamps collected automatically
              through server logs and essential cookies needed to operate the site securely.
            </li>
          </ul>
          <p>
            We do not intentionally collect sensitive personal data through our public website
            forms. Please do not submit passwords, full financial records, or other confidential
            client information unless we have expressly requested it through a secure channel.
          </p>

          <h2>3. How We Use Your Data</h2>
          <p>We use personal data for the following purposes:</p>
          <ul>
            <li>Responding to enquiries and scheduling consultations you request.</li>
            <li>Sending newsletter and blog updates to subscribers who have opted in.</li>
            <li>Reviewing and processing job applications for open positions.</li>
            <li>Operating, securing, and improving our website and communications.</li>
            <li>Complying with legal, regulatory, and professional obligations applicable to our firm.</li>
          </ul>
          <p>
            We process data where permitted under India&apos;s Digital Personal Data Protection Act,
            2023 (DPDP Act), including on the basis of your consent, for the performance of steps
            taken at your request before entering a service relationship, and where necessary for
            legitimate uses recognised by law.
          </p>

          <h2>4. Cookies and Similar Technologies</h2>
          <p>
            Our website uses essential cookies and similar technologies required for basic
            functionality, security, and session management. We do not currently use third-party
            advertising or behavioural analytics cookies on teotiaco.com.
          </p>
          <p>
            You can control cookies through your browser settings. Disabling essential cookies may
            affect how certain parts of the site work.
          </p>

          <h2>5. How We Share Data</h2>
          <p>
            We do not sell or rent your personal data. We may share data only with trusted service
            providers who help us operate our business, such as:
          </p>
          <ul>
            <li>Website hosting and infrastructure providers.</li>
            <li>Email delivery services used for enquiries, newsletters, and application confirmations.</li>
            <li>Cloud storage providers used to store job application materials securely.</li>
          </ul>
          <p>
            These providers process data on our instructions and are expected to maintain
            appropriate confidentiality and security safeguards. We may also disclose information
            where required by law, court order, or a competent authority.
          </p>

          <h2>6. Data Retention</h2>
          <p>We retain personal data only for as long as necessary for the purposes described above:</p>
          <ul>
            <li>
              <strong>Enquiries:</strong> typically up to 24 months after the enquiry is closed,
              unless a longer period is needed for follow-up or compliance.
            </li>
            <li>
              <strong>Newsletter subscriptions:</strong> until you unsubscribe or we remove inactive
              records in line with our mailing practices.
            </li>
            <li>
              <strong>Job applications:</strong> for the recruitment cycle and a reasonable period
              thereafter for talent-pool or legal purposes, unless you request earlier deletion where
              applicable.
            </li>
            <li>
              <strong>Server logs:</strong> for a limited period required for security and
              troubleshooting.
            </li>
          </ul>

          <h2>7. Data Security</h2>
          <p>
            We implement reasonable administrative, technical, and organisational measures to protect
            personal data against unauthorised access, loss, misuse, or alteration. No method of
            transmission over the internet is completely secure; while we work to safeguard your
            information, we cannot guarantee absolute security.
          </p>

          <h2>8. Your Rights Under the DPDP Act, 2023</h2>
          <p>
            Subject to applicable law, you may have the right to access, correct, complete, update,
            or erase your personal data, withdraw consent where processing is consent-based, and
            nominate another person to exercise your rights in the event of death or incapacity.
          </p>
          <p>
            You may also have the right to grievance redressal and, where applicable, to approach
            the Data Protection Board of India. To exercise your rights, contact us using the details
            below. We may need to verify your identity before responding.
          </p>
          <p>
            Newsletter subscribers can unsubscribe at any time using the link in our emails or via
            our <Link href="/unsubscribe">unsubscribe page</Link>.
          </p>

          <h2>9. Grievance Officer</h2>
          <p>
            For questions, concerns, or complaints about how we handle personal data, please contact
            our Grievance Officer:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
            </li>
            <li>
              <strong>Postal address:</strong> TEOTIA &amp; CO., {SITE_CONTACT.location}
            </li>
          </ul>
          <p>We aim to acknowledge grievances within 7 business days and resolve them within applicable statutory timelines.</p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>
            Our website and services are directed at businesses and adults. We do not knowingly
            collect personal data from children under 18. If you believe a child has provided us
            data, please contact us so we can take appropriate steps.
          </p>

          <h2>11. Cross-Border Processing</h2>
          <p>
            Our website and certain service providers may process or store data on servers located
            outside India. Where this occurs, we take steps reasonably required to ensure that
            appropriate safeguards are in place consistent with applicable law.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be posted on
            this page with a revised &ldquo;Last updated&rdquo; date. We encourage you to review
            this page periodically.
          </p>

          <h2>13. Related Information</h2>
          <p>
            Please also read our <Link href="/terms-of-service">Terms of Service</Link>, which
            govern use of this website. For service-specific enquiries, visit our{' '}
            <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
