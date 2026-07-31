import Link from 'next/link';
import { notFound } from 'next/navigation';
import CtaBanner from '@/components/CtaBanner';
import { Reveal, RevealText } from '@/components/Reveal';
import ServiceDetailChecks from '@/components/ServiceDetailChecks';
import {
  getAllServiceSlugs,
  getServiceBySlug,
  services,
} from '@/lib/services';
import { buildConsultationUrl, mapServiceSlugToEnquiryType } from '@/lib/consultation';
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

  return {
    title: `${service.title} | TEOTIA & CO.`,
    description: service.description[0],
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
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
                href={buildConsultationUrl({
                  source: `service-${slug}`,
                  service: mapServiceSlugToEnquiryType(slug),
                })}
                className="service-book-btn"
              >
                Book Now
              </Link>

              <div className="service-detail-divider" />

              <RevealText as="h2">Service Description</RevealText>
              {service.description.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="service-detail-copy">
                  {paragraph}
                </p>
              ))}

              <ServiceDetailChecks items={service.highlights} />
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
                      {item.title}
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
