export const CONSULTATION_INTENT = 'consultation';
export const DEFAULT_CONSULTATION_SERVICE =
  'Taxation, Accounting & Compliance Support';
export const CONSULTATION_SUBJECT = 'Free Consultation Request';
export const CONSULTATION_MESSAGE_PLACEHOLDER =
  'Tell us about your business and what you would like to discuss during your free consultation...';

/** Maps frontend service page slugs to backend enquiry service types. */
const SERVICE_SLUG_TO_TYPE: Record<string, string> = {
  'company-incorporation': 'Company Incorporation & Business Setup Services',
  'corporate-secretarial': 'Corporate Secretarial Compliance & Advisory',
  'fdi-fema-advisory': 'FDI, FEMA & Cross-Border Investment Advisory',
  'regulatory-approvals': 'Regulatory Approvals & Government Liaison',
  'ma-transaction-advisory': 'M&A and Transaction Advisory Services',
  'contracts-agreements': 'Contracts & Commercial Agreements',
  'startup-msme-advisory': 'Startup, MSME & Business Growth Advisory',
  'ipr-protection': 'IPR Protection Services',
  'taxation-accounting': 'Taxation, Accounting & Compliance Support',
  'corporate-restructuring': 'Corporate Restructuring, Due Diligence',
};

export type ConsultationParams = {
  isConsultation: boolean;
  serviceType: string;
  subject: string;
  source: string | null;
};

export function buildConsultationUrl(options?: {
  source?: string;
  service?: string;
}): string {
  const params = new URLSearchParams({ intent: CONSULTATION_INTENT });

  if (options?.source) {
    params.set('source', options.source);
  }

  if (options?.service) {
    params.set('service', options.service);
  }

  return `/contact?${params.toString()}`;
}

export function mapServiceSlugToEnquiryType(slug: string): string {
  return SERVICE_SLUG_TO_TYPE[slug] ?? DEFAULT_CONSULTATION_SERVICE;
}

export function resolveConsultationServiceType(
  serviceParam: string | null,
  allowedTypes: string[]
): string {
  if (serviceParam && allowedTypes.includes(serviceParam)) {
    return serviceParam;
  }

  if (allowedTypes.includes(DEFAULT_CONSULTATION_SERVICE)) {
    return DEFAULT_CONSULTATION_SERVICE;
  }

  return allowedTypes[0] ?? DEFAULT_CONSULTATION_SERVICE;
}

export function parseConsultationParams(
  searchParams: URLSearchParams,
  allowedServiceTypes: string[] = []
): ConsultationParams {
  const isConsultation = searchParams.get('intent') === CONSULTATION_INTENT;
  const source = searchParams.get('source');
  const serviceParam = searchParams.get('service');

  if (!isConsultation) {
    return {
      isConsultation: false,
      serviceType: serviceParam && allowedServiceTypes.includes(serviceParam) ? serviceParam : '',
      subject: '',
      source,
    };
  }

  return {
    isConsultation: true,
    serviceType: resolveConsultationServiceType(serviceParam, allowedServiceTypes),
    subject: CONSULTATION_SUBJECT,
    source,
  };
}

export function appendConsultationSource(message: string, source: string | null): string {
  if (!source) {
    return message;
  }

  const prefix = `[Source: ${source}]\n\n`;
  if (message.startsWith('[Source:')) {
    return message;
  }

  return `${prefix}${message}`;
}

const CONSULTATION_SOURCE_PREFIX = /^\[Source:\s*(.+?)\]\s*(?:\r?\n\r?\n|\r?\n)?/;

/** Split stored enquiry text into optional source metadata and user-visible body. */
export function parseConsultationMessage(message: string): {
  source: string | null;
  body: string;
} {
  const match = message.match(CONSULTATION_SOURCE_PREFIX);
  if (!match) {
    return { source: null, body: message };
  }

  return {
    source: match[1].trim(),
    body: message.slice(match[0].length),
  };
}
