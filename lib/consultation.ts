import { getServiceBySlug, services } from './services';

export const CONSULTATION_INTENT = 'consultation';
export const DEFAULT_CONSULTATION_SERVICE =
  'Taxation, Accounting & Compliance Support';
export const CONSULTATION_SUBJECT = 'Free Consultation Request';
export const CONSULTATION_MESSAGE_PLACEHOLDER =
  'Tell us about your business and what you would like to discuss during your free consultation...';

/**
 * Reverse map: backend enquiry type → service page slug.
 * Service titles in lib/services.ts must stay aligned with backend SERVICE_TYPES.
 */
const ENQUIRY_TYPE_TO_SLUG: Record<string, string> = Object.fromEntries(
  services.map((service) => [service.title, service.slug])
);

export type ResolvedServiceParam = {
  slug: string | null;
  enquiryType: string | null;
};

/** Whether `slug` matches a known `/services/[slug]` route. */
export function isValidServiceSlug(slug: string): boolean {
  return getServiceBySlug(slug) !== undefined;
}

/**
 * Resolve a raw `service` query value to slug + backend enquiry type.
 * Accepts URL-safe slugs (new) or full enquiry type strings (legacy URLs).
 */
export function resolveServiceParam(
  raw: string | null,
  allowedServiceTypes: string[] = []
): ResolvedServiceParam {
  if (!raw?.trim()) {
    return { slug: null, enquiryType: null };
  }

  const value = raw.trim();

  if (isValidServiceSlug(value)) {
    return {
      slug: value,
      enquiryType: mapServiceSlugToEnquiryType(value),
    };
  }

  const slugFromEnquiryType = ENQUIRY_TYPE_TO_SLUG[value];
  if (slugFromEnquiryType) {
    return {
      slug: slugFromEnquiryType,
      enquiryType: value,
    };
  }

  if (allowedServiceTypes.includes(value)) {
    return {
      slug: ENQUIRY_TYPE_TO_SLUG[value] ?? null,
      enquiryType: value,
    };
  }

  return { slug: null, enquiryType: null };
}

export type ConsultationParams = {
  isConsultation: boolean;
  serviceType: string;
  subject: string;
  source: string | null;
};

export type BuildConsultationUrlOptions = {
  /** URL-safe service slug — emits `/contact?service={slug}` only. */
  serviceSlug?: string;
  /** Lead attribution for generic consultation CTAs (C3: kept in URL). */
  source?: string;
};

export function buildConsultationUrl(options?: BuildConsultationUrlOptions): string {
  if (options?.serviceSlug) {
    if (!isValidServiceSlug(options.serviceSlug)) {
      throw new Error(
        `buildConsultationUrl: unknown service slug "${options.serviceSlug}"`
      );
    }

    const params = new URLSearchParams({ service: options.serviceSlug });
    return `/contact?${params.toString()}`;
  }

  const params = new URLSearchParams({ intent: CONSULTATION_INTENT });

  if (options?.source) {
    params.set('source', options.source);
  }

  return `/contact?${params.toString()}`;
}

/** Maps a service page slug to the backend enquiry dropdown value. */
export function mapServiceSlugToEnquiryType(slug: string): string {
  return getServiceBySlug(slug)?.title ?? DEFAULT_CONSULTATION_SERVICE;
}

/** Lead attribution for service CTAs — derived from slug, not exposed in the URL (C1). */
export function deriveConsultationSourceFromSlug(slug: string): string {
  return `service-${slug}`;
}

function resolvePrefilledServiceType(
  serviceParam: string | null,
  allowedTypes: string[]
): string {
  const resolved = resolveServiceParam(serviceParam, allowedTypes);

  if (resolved.enquiryType && allowedTypes.includes(resolved.enquiryType)) {
    return resolved.enquiryType;
  }

  return '';
}

export function resolveConsultationServiceType(
  serviceParam: string | null,
  allowedTypes: string[]
): string {
  const prefilled = resolvePrefilledServiceType(serviceParam, allowedTypes);
  if (prefilled) {
    return prefilled;
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
  const explicitIntent = searchParams.get('intent') === CONSULTATION_INTENT;
  const urlSource = searchParams.get('source');
  const serviceParam = searchParams.get('service');

  const resolved = resolveServiceParam(serviceParam, allowedServiceTypes);
  const isServiceSlugUrl =
    Boolean(resolved.slug) && serviceParam?.trim() === resolved.slug;
  const isConsultation = explicitIntent || isServiceSlugUrl;

  // C1: prefer explicit URL source (legacy); derive from slug when omitted
  const source =
    urlSource ??
    (resolved.slug ? deriveConsultationSourceFromSlug(resolved.slug) : null);

  if (!isConsultation) {
    return {
      isConsultation: false,
      serviceType: resolvePrefilledServiceType(serviceParam, allowedServiceTypes),
      subject: '',
      source: urlSource,
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
