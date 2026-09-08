import Link from 'next/link';
import { notFound } from 'next/navigation';
import CtaBanner from '@/components/CtaBanner';
import { SchemaOrg } from '@/components/SchemaOrg';
import { Reveal, RevealText } from '@/components/Reveal';
import ServiceDetailChecks from '@/components/ServiceDetailChecks';
import {
  buildServiceFaqSchema,
  getAllServiceSlugs,
  getServiceBySlug,
  services,
} from '@/lib/services';
import { buildConsultationUrl } from '@/lib/consultation';
import { generatePageMetadata } from '@/lib/metadata';
import '../../page-styles.css';

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return { title: 'Service Not Found | TEOTIA & CO.' };
  }

  return generatePageMetadata({
    title: service.seoTitle,
    description: service.metaDescription,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const faqSchema = buildServiceFaqSchema(service.faqs, `/services/${slug}`);

  return (
    <>
      {faqSchema && <SchemaOrg schema={faqSchema} />}

      <section className="service-detail">
        <div className="service-detail-inner">
          <nav className="service-detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/services">Service list</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{service.title}</span>
          </nav>

          <div className="service-detail-layout">
            <div className="service-detail-main">
              <RevealText as="h1">{service.title}</RevealText>
              <p className="service-detail-tagline">{service.tagline}</p>

              <div className="service-detail-meta" title={service.priceLabel}>
                <span className="service-meta-value">{service.duration}</span>
                <span className="service-meta-divider" aria-hidden="true" />
                <span className="service-meta-value">{service.price}</span>
              </div>

              <Link
                href={buildConsultationUrl({ serviceSlug: slug })}
                className="service-book-btn"
              >
                Book Now
              </Link>

              <div className="service-detail-divider" />

              <p className="service-detail-copy">{service.intro}</p>

              <RevealText as="h2">What&apos;s included</RevealText>
              <ServiceDetailChecks items={service.whatsIncluded} />

              <RevealText as="h2">Who this is for</RevealText>
              <p className="service-detail-copy">{service.whoThisIsFor}</p>

              {service.ourApproach && (
                <>
                  <RevealText as="h2">Our approach</RevealText>
                  <p className="service-detail-copy">{service.ourApproach}</p>
                </>
              )}

              {service.relatedLinks && service.relatedLinks.length > 0 && (
                <p className="service-detail-copy service-detail-related">
                  Related services:{' '}
                  {service.relatedLinks.map((link, index) => (
                    <span key={link.slug}>
                      {index > 0 && (index === service.relatedLinks!.length - 1 ? ', and ' : ', ')}
                      <Link href={`/services/${link.slug}`}>{link.label}</Link>
                    </span>
                  ))}
                  .
                </p>
              )}

              {service.faqs.length > 0 && (
                <div className="service-detail-faq">
                  <RevealText as="h2">Frequently asked questions</RevealText>
                  <dl className="service-faq-list">
                    {service.faqs.map((faq) => (
                      <div key={faq.question} className="service-faq-item">
                        <dt>{faq.question}</dt>
                        <dd>{faq.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <Reveal>
              <aside className="service-detail-sidebar">
                <RevealText as="h2">Services</RevealText>
                <ul className="service-detail-nav">
                  {services.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/services/${item.slug}`}
                        className={
                          item.slug === service.slug
                            ? 'service-detail-nav-link active'
                            : 'service-detail-nav-link'
                        }
                      >
                        {item.listTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
