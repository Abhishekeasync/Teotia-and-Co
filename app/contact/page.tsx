'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  HeroReveal,
  Reveal,
  RevealText,
  Stagger,
  StaggerItem,
} from '@/components/Reveal';
import { publicApi, ApiClientError } from '@/lib/api/client';
import { validateName, validateEmail, validatePhone } from '@/lib/validation';
import { showValidationToasts } from '@/lib/toast-validation';
import {
  appendConsultationSource,
  CONSULTATION_MESSAGE_PLACEHOLDER,
  parseConsultationParams,
} from '@/lib/consultation';
import { toast } from 'sonner';
import { SITE_CONTACT } from '@/lib/site';
import '../page-styles.css';

const DEFAULT_SERVICE_TYPES = [
  'Tax Planning & Filing',
  'Business Registration',
  'GST Services',
  'Accounting & Bookkeeping',
  'Audit Services',
  'Financial Consulting',
  'Compliance Management',
  'Legal Advisory',
  'Other',
];

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageFallback />}>
      <ContactPageContent />
    </Suspense>
  );
}

function ContactPageFallback() {
  return (
    <section className="about-hero">
      <div className="about-hero-content">
        <h1 className="contact-hero-title">Start Your Financial Journey</h1>
        <p className="about-hero-sub">Loading contact form...</p>
      </div>
    </section>
  );
}

function ContactPageContent() {
  const searchParams = useSearchParams();
  const formSectionRef = useRef<HTMLElement>(null);
  const [serviceTypes, setServiceTypes] = useState<string[]>(DEFAULT_SERVICE_TYPES);
  const [loading, setLoading] = useState(false);
  const [isConsultation, setIsConsultation] = useState(false);
  const [consultationSource, setConsultationSource] = useState<string | null>(null);
  const [prefillApplied, setPrefillApplied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch service types
  useEffect(() => {
    async function fetchServiceTypes() {
      try {
        const response = await publicApi.enquiries.getServiceTypes();
        const data = response as any;
        setServiceTypes(data.data?.serviceTypes || DEFAULT_SERVICE_TYPES);
      } catch (error) {
        console.error('Failed to fetch service types:', error);
        setServiceTypes(DEFAULT_SERVICE_TYPES);
      }
    }

    fetchServiceTypes();
  }, []);

  // Apply consultation pre-fill from URL params
  useEffect(() => {
    if (prefillApplied || serviceTypes.length === 0) {
      return;
    }

    const consultation = parseConsultationParams(searchParams, serviceTypes);

    if (consultation.isConsultation) {
      setIsConsultation(true);
      setConsultationSource(consultation.source);
      setFormData((prev) => ({
        ...prev,
        serviceType: consultation.serviceType,
        subject: consultation.subject,
      }));

      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (consultation.serviceType) {
      setFormData((prev) => ({
        ...prev,
        serviceType: consultation.serviceType,
      }));
    }

    setPrefillApplied(true);
  }, [searchParams, serviceTypes, prefillApplied]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.serviceType) {
      newErrors.serviceType = 'Please select a service';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    } else if (formData.subject.trim().length > 500) {
      newErrors.subject = 'Subject must be less than 500 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 5000) {
      newErrors.message = 'Message must be less than 5000 characters';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      showValidationToasts(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const message = appendConsultationSource(formData.message.trim(), consultationSource);

      await publicApi.enquiries.create({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        serviceType: formData.serviceType,
        subject: formData.subject.trim(),
        message,
      });

      toast.success(
        isConsultation
          ? 'Your free consultation request has been received. We will contact you within 1 business day.'
          : 'Thank you for your message! We will get back to you shortly.'
      );

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        serviceType: '',
        subject: '',
        message: '',
      });
      setErrors({});
      setIsConsultation(false);
      setConsultationSource(null);
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : 'Failed to submit enquiry. Please try again.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <HeroReveal delay={0}>
            <h1 className="contact-hero-title">Start Your Financial Journey</h1>
          </HeroReveal>
          <HeroReveal delay={0.08}>
            <p className="about-hero-sub">
              Have questions about accounting, tax planning, or business finances? TEOTIA &amp; CO. is here to provide clear guidance and reliable support.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.16}>
            <nav className="about-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Contact</span>
            </nav>
          </HeroReveal>
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section className="section">
        <div className="contact-intro">
          <RevealText as="h2">Get in Touch With TEOTIA &amp; CO.</RevealText>
          <RevealText as="p" delay={0.08}>
            Get in touch with TEOTIA &amp; CO. for clear, reliable financial support.
          </RevealText>
        </div>

        <Stagger className="contact-cards">
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3>Email</h3>
            <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
          </StaggerItem>
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3>Phone Number</h3>
            <a href={`tel:${SITE_CONTACT.phoneTel}`}>{SITE_CONTACT.phoneDisplay}</a>
          </StaggerItem>
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3>Location</h3>
            <p>{SITE_CONTACT.location}</p>
          </StaggerItem>
          <StaggerItem className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Working Hours</h3>
            <p>{SITE_CONTACT.workingHours}</p>
          </StaggerItem>
        </Stagger>
      </section>

      {/* CONTACT FORM */}
      <section className="section section-gray" id="contact-form" ref={formSectionRef}>
        <div className="contact-form-layout">
          <Reveal className="contact-form-image">
            <Image
              src="/assets/images/static.wixstatic.com/download-2-jfif.jpg"
              alt="Professional handshake during a business meeting"
              width={600}
              height={800}
              priority
            />
          </Reveal>

          <Reveal>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  maxLength={255}
                  style={{ borderColor: errors.name ? '#ef4444' : undefined }}
                />
                {errors.name && (
                  <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  maxLength={50}
                  style={{ borderColor: errors.phone ? '#ef4444' : undefined }}
                />
                {errors.phone && (
                  <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  maxLength={255}
                  style={{ borderColor: errors.email ? '#ef4444' : undefined }}
                />
                {errors.email && (
                  <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="serviceType">Service *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  style={{ borderColor: errors.serviceType ? '#ef4444' : undefined }}
                >
                  <option value="">Select a service</option>
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                {errors.serviceType && (
                  <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.serviceType}
                  </span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary of your enquiry"
                  maxLength={500}
                  style={{ borderColor: errors.subject ? '#ef4444' : undefined }}
                />
                {errors.subject && (
                  <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.subject}
                  </span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={
                    isConsultation
                      ? CONSULTATION_MESSAGE_PLACEHOLDER
                      : 'Tell us about your needs...'
                  }
                  maxLength={5000}
                  rows={5}
                  style={{ borderColor: errors.message ? '#ef4444' : undefined }}
                />
                {errors.message && (
                  <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.message}
                  </span>
                )}
              </div>

              <div className="form-submit">
                <button type="submit" className="btn-green" disabled={loading}>
                  {loading
                    ? 'Sending...'
                    : isConsultation
                      ? 'Request Free Consultation'
                      : 'Send Message'}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
