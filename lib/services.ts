export type ServiceFaq = {
  question: string;
  answer: string;
};

export type RelatedServiceLink = {
  slug: string;
  label: string;
};

export type Service = {
  slug: string;
  listTitle: string;
  linkLabel: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  tagline: string;
  duration: string;
  price: string;
  priceLabel: string;
  shortDescription: string;
  features: string[];
  intro: string;
  whatsIncluded: string[];
  whoThisIsFor: string;
  ourApproach?: string;
  faqs: ServiceFaq[];
  relatedLinks?: RelatedServiceLink[];
};

export const services: Service[] = [
  {
    slug: 'company-incorporation',
    listTitle: 'Company Incorporation & Business Setup',
    linkLabel: 'Learn about company registration in Noida',
    title: 'Company Registration & Business Setup Consultants in Noida',
    seoTitle: 'Company Registration Consultant in Noida | Teotia & Co.',
    metaDescription:
      'Private limited, LLP & OPC registration in Noida with end-to-end statutory approvals. Chartered accountant-led incorporation support. Book a call.',
    tagline: 'Chartered accountant-led incorporation from structure to statutory approvals',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'Private limited, LLP & OPC registration in Noida with end-to-end statutory approvals and post-incorporation compliance setup.',
    features: [
      'Entity structure guidance (Pvt Ltd, LLP, OPC)',
      'MCA registration and statutory approvals',
      'PAN, TAN, and GST registration post-incorporation',
    ],
    intro:
      'Choosing the right business structure and getting it registered correctly is the foundation everything else builds on. Teotia & Co. helps founders, startups, and investors in Noida and across India incorporate the right entity the first time, with statutory approvals handled end-to-end.',
    whatsIncluded: [
      'Guidance on choosing the right structure: Private Limited Company, LLP, OPC, or Partnership',
      'Company/LLP registration with the Ministry of Corporate Affairs (MCA)',
      'PAN, TAN, and GST registration post-incorporation',
      'Drafting of MOA, AOA, and founder agreements',
      'Bank account opening support and initial compliance setup',
      'Post-incorporation statutory checklist so you start compliant from day one',
    ],
    whoThisIsFor:
      'First-time founders and investors setting up a new entity in India who want the structuring decision (not just the paperwork) handled by a chartered accountant, not a generic filing agent.',
    ourApproach:
      'We start with a short consultation to understand your business model, funding plans, and ownership structure, then recommend the entity type that minimizes tax and compliance friction before filing anything.',
    faqs: [
      {
        question: 'How long does private limited company registration take?',
        answer:
          'Typically 7–15 working days from document submission, depending on MCA processing times and name approval.',
      },
      {
        question: 'Should I register a Private Limited Company or an LLP?',
        answer:
          'It depends on your funding plans, liability needs, and compliance appetite. We walk through this with you before recommending a structure rather than defaulting to one.',
      },
      {
        question: 'Do you help with registrations after incorporation, like GST and PAN?',
        answer:
          'Yes, incorporation support includes PAN, TAN, and GST registration so the entity is operational, not just legally formed.',
      },
    ],
    relatedLinks: [
      { slug: 'taxation-accounting', label: 'GST registration and compliance' },
      { slug: 'corporate-secretarial', label: 'corporate secretarial compliance' },
    ],
  },
  {
    slug: 'corporate-secretarial',
    listTitle: 'Corporate Secretarial Compliance',
    linkLabel: 'View corporate secretarial compliance services',
    title: 'Corporate Secretarial Compliance Services in Noida',
    seoTitle: 'Corporate Secretarial Compliance Services | Teotia & Co.',
    metaDescription:
      'ROC filings, board & shareholder compliance, and statutory registers managed for companies in Noida & across India. Stay compliant, stay audit-ready.',
    tagline: 'ROC filings, governance, and statutory registers managed end-to-end',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'ROC filings, board and shareholder compliance, and statutory registers for companies in Noida and across India.',
    features: [
      'Annual ROC filings and MCA compliance',
      'Board and shareholder meeting compliance',
      'Statutory registers and compliance audits',
    ],
    intro:
      'Corporate governance compliance is easy to deprioritize until an ROC notice or audit flags a lapse. Teotia & Co. manages ongoing secretarial compliance for private and public companies, so board processes and statutory filings stay current without pulling your team\'s attention away from the business.',
    whatsIncluded: [
      'Annual ROC filings and Registrar of Companies compliance',
      'Board meeting and shareholder meeting compliance (notices, minutes, resolutions)',
      'Maintenance of statutory registers and records',
      'Compliance audits to identify and close gaps before they become penalties',
      'Advisory on corporate governance and Companies Act requirements',
      'Support during regulatory inspections or ROC queries',
    ],
    whoThisIsFor:
      'Companies that need ongoing secretarial compliance managed by advisors who understand governance requirements, not just annual return filing as a checkbox exercise.',
    faqs: [
      {
        question: 'What happens if a company misses ROC filing deadlines?',
        answer:
          'Missed filings attract additional government fees and can lead to penalties or director disqualification in repeated cases. We set up a compliance calendar specifically to prevent this.',
      },
      {
        question: 'Do you handle statutory registers and minute books, or only filings?',
        answer:
          'Both. We maintain statutory registers, board/shareholder meeting records, and handle the filings that flow from them.',
      },
      {
        question: 'Can you run a compliance audit for a company that hasn\'t had one before?',
        answer:
          'Yes, this is a common starting point. We review the company\'s filing and governance history and build a remediation plan for any gaps found.',
      },
    ],
    relatedLinks: [
      { slug: 'company-incorporation', label: 'company registration and setup' },
      { slug: 'taxation-accounting', label: 'tax and accounting compliance' },
    ],
  },
  {
    slug: 'fdi-fema-advisory',
    listTitle: 'FDI, FEMA & Cross-Border Investment',
    linkLabel: 'Explore FDI and FEMA compliance advisory',
    title: 'FEMA Compliance & FDI Advisory for Cross-Border Investment',
    seoTitle: 'FEMA & FDI Compliance Advisory in India | Teotia & Co.',
    metaDescription:
      'FDI structuring, FEMA compliance, and RBI reporting for cross-border investments into India. Expert advisory for foreign investors & Indian entities.',
    tagline: 'FDI structuring, FEMA compliance, and RBI reporting from day one',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'FDI structuring, FEMA compliance, and RBI reporting for cross-border investments into and from India.',
    features: [
      'FDI structuring under automatic and approval routes',
      'FEMA compliance and RBI reporting',
      'Sector-specific FDI cap advisory',
    ],
    intro:
      'Foreign investment into India comes with regulatory requirements that are easy to get wrong and expensive to fix after the fact. Teotia & Co. advises foreign investors, Indian entities receiving FDI, and cross-border businesses on FEMA compliance and RBI reporting from structuring through to filing.',
    whatsIncluded: [
      'FDI structuring under the automatic and government approval routes',
      'FEMA compliance advisory for inbound and outbound transactions',
      'RBI reporting: FC-GPR, FC-TRS, and other regulatory filings',
      'Advisory on sector-specific FDI caps and conditions',
      'Liaison with RBI and regulatory authorities on approvals',
      'Ongoing FEMA compliance monitoring for entities with foreign shareholding',
    ],
    whoThisIsFor:
      'Foreign investors entering the Indian market, and Indian companies receiving foreign investment, who need the structuring and compliance handled by advisors who work in this area regularly, not as a one-off.',
    ourApproach:
      'We review the proposed transaction structure against current FEMA regulations and sector caps before any capital moves, then handle the reporting obligations that follow, so structuring and compliance stay aligned instead of being treated as separate steps.',
    faqs: [
      {
        question: 'What is FC-GPR filing and when is it required?',
        answer:
          'FC-GPR is the RBI filing required when an Indian company issues shares to a foreign investor; it must be filed within the prescribed timeline after allotment.',
      },
      {
        question: 'Do all sectors allow 100% FDI under the automatic route?',
        answer:
          'No. FDI limits and routes vary by sector. We advise on the applicable cap and route for your specific business before structuring the investment.',
      },
      {
        question: 'Can you assist investors who are not yet incorporated in India?',
        answer:
          'Yes, we advise on structuring options for foreign investors at the pre-incorporation stage, including entity choice and compliance implications.',
      },
    ],
    relatedLinks: [
      { slug: 'ma-transaction-advisory', label: 'M&A and transaction advisory' },
      { slug: 'corporate-restructuring', label: 'corporate restructuring and due diligence' },
    ],
  },
  {
    slug: 'regulatory-approvals',
    listTitle: 'Regulatory Approvals & Government Liaison',
    linkLabel: 'See regulatory approvals and licensing support',
    title: 'Regulatory Approvals & Government Liaison',
    seoTitle: 'Regulatory Approvals & Government Liaison | Teotia & Co.',
    metaDescription:
      'Registrations, licenses, and regulatory clearances for businesses in Noida and across India. Expert coordination with government authorities.',
    tagline: 'Registrations, licenses, and clearances without delay',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'We assist businesses in obtaining various registrations, licenses, approvals, and regulatory clearances.',
    features: [
      'Registrations and licenses',
      'Government coordination',
      'Procedural compliance',
    ],
    intro:
      'We assist businesses in obtaining various registrations, licenses, approvals, and regulatory clearances. Through effective coordination with government authorities and regulatory bodies, we help clients navigate procedural requirements efficiently while ensuring full compliance with applicable laws and regulations.',
    whatsIncluded: [
      'Registrations, licenses, and approvals',
      'Regulatory clearances',
      'Coordination with government authorities',
      'Procedural guidance',
      'Full compliance with applicable laws',
    ],
    whoThisIsFor:
      'Businesses that need licenses, registrations, or government clearances handled efficiently with procedural expertise and regulatory follow-through.',
    faqs: [],
    relatedLinks: [
      { slug: 'company-incorporation', label: 'company incorporation and setup' },
      { slug: 'corporate-secretarial', label: 'ongoing corporate compliance' },
    ],
  },
  {
    slug: 'ma-transaction-advisory',
    listTitle: 'M&A and Transaction Advisory',
    linkLabel: 'View M&A and transaction advisory services',
    title: 'M&A and Transaction Advisory Services',
    seoTitle: 'M&A and Transaction Advisory Services | Teotia & Co.',
    metaDescription:
      'Deal structuring, due diligence coordination & documentation support for mergers, acquisitions & investments. Transaction advisory from Teotia & Co.',
    tagline: 'Structuring, diligence, and documentation through closing',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'Deal structuring, due diligence coordination, and documentation support for mergers, acquisitions, and investments.',
    features: [
      'Transaction structuring',
      'Due diligence coordination',
      'Documentation and regulatory compliance',
    ],
    intro:
      'Mergers, acquisitions, and investment transactions succeed or fail on the details: structuring, diligence, and documentation done right the first time. Teotia & Co. supports businesses and investors through the full transaction lifecycle, from initial structuring through closing.',
    whatsIncluded: [
      'Transaction structuring for mergers, acquisitions, and investments',
      'Due diligence coordination (financial, tax, and regulatory)',
      'Deal documentation support, working alongside legal counsel',
      'Regulatory compliance assistance for transaction approvals',
      'Post-transaction integration and compliance advisory',
    ],
    whoThisIsFor:
      'Companies and investors navigating a merger, acquisition, or significant investment transaction who need financial and regulatory advisory coordinated with legal counsel, not working in isolation from it.',
    faqs: [
      {
        question: 'What\'s the difference between due diligence coordination and a full due diligence report?',
        answer:
          'We coordinate the diligence process across financial, tax, and regulatory workstreams and can produce full diligence reports. Scope depends on transaction size and your requirements.',
      },
      {
        question: 'Do you work alongside our existing legal counsel on a deal?',
        answer:
          'Yes, transaction advisory typically runs in parallel with legal counsel. We handle the financial, tax, and regulatory workstreams while legal handles contractual matters.',
      },
    ],
    relatedLinks: [
      { slug: 'corporate-restructuring', label: 'corporate restructuring and valuation' },
      { slug: 'fdi-fema-advisory', label: 'FDI and FEMA compliance' },
    ],
  },
  {
    slug: 'contracts-agreements',
    listTitle: 'Contracts & Commercial Agreements',
    linkLabel: 'Learn about contract drafting and review',
    title: 'Contracts & Commercial Agreements',
    seoTitle: 'Contracts & Commercial Agreements | Teotia & Co.',
    metaDescription:
      'Contract drafting, review, and commercial agreement advisory for businesses in Noida and across India. Reduce legal risk with structured documentation.',
    tagline: 'Documents designed to safeguard interests and reduce risk',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'We draft, review, and advise on a wide range of legal and commercial documents.',
    features: [
      'Contract drafting and review',
      'Shareholder and investment documents',
      'Commercial arrangements',
    ],
    intro:
      'We draft, review, and advise on a wide range of legal and commercial documents. Our services include contracts, shareholder agreements, investment documents, business arrangements, and other commercial agreements designed to safeguard interests and reduce legal risks.',
    whatsIncluded: [
      'Contract drafting and review',
      'Shareholder agreements',
      'Investment documents',
      'Business and commercial arrangements',
      'Risk-focused legal documentation',
    ],
    whoThisIsFor:
      'Businesses that need commercial agreements drafted or reviewed with financial and regulatory context, not generic templates disconnected from how the deal actually works.',
    faqs: [],
    relatedLinks: [
      { slug: 'ma-transaction-advisory', label: 'M&A and transaction advisory' },
      { slug: 'startup-msme-advisory', label: 'startup and MSME advisory' },
    ],
  },
  {
    slug: 'startup-msme-advisory',
    listTitle: 'Startup & MSME Business Advisory',
    linkLabel: 'Explore startup and MSME advisory in Noida',
    title: 'Startup & MSME Business Advisory Services in Noida',
    seoTitle: 'Startup & MSME Business Advisory in Noida | Teotia & Co.',
    metaDescription:
      'Business planning, MSME registration, and fundraising support for startups and growing businesses in Noida & Delhi NCR. Talk to our advisory team.',
    tagline: 'Advisory that scales from registration through fundraising',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'Business planning, MSME registration, and fundraising support for startups and growing businesses in Noida and Delhi NCR.',
    features: [
      'Business planning and financial modeling',
      'MSME (Udyam) registration advisory',
      'Fundraising and diligence readiness support',
    ],
    intro:
      'Startups and MSMEs need advisory support that scales with them, from initial registration through fundraising rounds and operational growth. Teotia & Co. works with founders in Noida and across India as a long-term advisory partner rather than a one-time filing service.',
    whatsIncluded: [
      'Business planning and financial modeling support',
      'MSME (Udyam) registration and related benefits advisory',
      'Fundraising support: investor documentation, cap table structuring, due diligence readiness',
      'Growth-stage compliance planning as headcount and revenue scale',
      'Advisory on government schemes and incentives available to startups/MSMEs',
    ],
    whoThisIsFor:
      'Founders who want an advisory relationship that continues past incorporation, through fundraising, scaling, and the compliance changes that come with growth.',
    ourApproach:
      'We map your current stage (idea, early revenue, or scaling) to the registrations, compliance, and documentation you actually need next, so advisory stays practical rather than a generic checklist.',
    faqs: [
      {
        question: 'What benefits does MSME (Udyam) registration provide?',
        answer:
          'Registered MSMEs can access priority lending, government scheme eligibility, and certain tax and compliance benefits. We advise on which apply to your specific business.',
      },
      {
        question: 'Can you help prepare a startup for a fundraising round?',
        answer:
          'Yes. This includes getting financial documentation, cap table structuring, and diligence readiness in order before investor conversations begin.',
      },
    ],
    relatedLinks: [
      { slug: 'company-incorporation', label: 'company registration and setup' },
      { slug: 'taxation-accounting', label: 'taxation and accounting compliance' },
    ],
  },
  {
    slug: 'ipr-protection',
    listTitle: 'Trademark & IPR Protection',
    linkLabel: 'See trademark registration and IPR services',
    title: 'Trademark Registration & IPR Protection Services',
    seoTitle: 'Trademark Registration & IPR Services | Teotia & Co.',
    metaDescription:
      'Trademark registration, brand protection & IP portfolio management for businesses in Noida & across India. Protect your brand with Teotia & Co.',
    tagline: 'Register, protect, and manage your brand assets',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'Trademark registration, brand protection, and IP portfolio management for businesses in Noida and across India.',
    features: [
      'Trademark search and registration',
      'Brand protection strategy',
      'IP portfolio management',
    ],
    intro:
      'Your brand name, logo, and other intellectual property are business assets, and unprotected ones are vulnerable to disputes and infringement. Teotia & Co. helps businesses register and manage trademarks and broader IP portfolios as part of overall business advisory.',
    whatsIncluded: [
      'Trademark search, registration, and renewal',
      'Brand protection strategy and infringement advisory',
      'IP portfolio management for businesses with multiple marks or classes',
      'Coordination with IP counsel for disputes or oppositions',
      'Advisory on IP considerations during business structuring and transactions',
    ],
    whoThisIsFor:
      'Businesses registering a brand for the first time, or established businesses that need ongoing IP portfolio management alongside their broader tax and compliance advisory.',
    faqs: [
      {
        question: 'How long does trademark registration take in India?',
        answer:
          'It typically takes 12–24 months from filing to registration if there\'s no opposition, though the mark is usable and enforceable from the filing/examination stage in many cases.',
      },
      {
        question: 'Do you handle trademark registration for multiple classes at once?',
        answer:
          'Yes, we advise on which classes are relevant to your business and manage multi-class filings and portfolio tracking.',
      },
    ],
    relatedLinks: [
      { slug: 'startup-msme-advisory', label: 'startup and MSME advisory' },
      { slug: 'contracts-agreements', label: 'contracts and commercial agreements' },
    ],
  },
  {
    slug: 'taxation-accounting',
    listTitle: 'Taxation, Accounting & Compliance',
    linkLabel: 'View taxation and GST compliance in Noida',
    title: 'Taxation, Accounting & Compliance Services in Noida',
    seoTitle: 'Taxation & Accounting Services in Noida | Teotia & Co.',
    metaDescription:
      'Direct & indirect tax advisory, GST compliance, and financial reporting for businesses in Noida & Delhi NCR. Book a free consultation with our CAs.',
    tagline: 'Direct tax, GST, and financial reporting under one roof',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'Direct and indirect tax advisory, GST compliance, and financial reporting for businesses in Noida and Delhi NCR.',
    features: [
      'Income tax planning, filing, and advisory',
      'GST registration and return filing',
      'TDS compliance and statutory reporting',
    ],
    intro:
      'Running a business means managing statutory tax obligations without losing focus on growth. Teotia & Co. provides end-to-end tax compliance and accounting services for businesses, startups, and professionals across Noida and Delhi NCR, covering direct tax, indirect tax (GST), and financial reporting under one roof.',
    whatsIncluded: [
      'Income tax planning, filing, and advisory for companies, LLPs, and individuals',
      'GST registration, monthly/quarterly return filing, and reconciliation',
      'TDS compliance and return filing',
      'Statutory financial reporting and bookkeeping support',
      'Tax audit coordination and representation before authorities',
      'Compliance calendars so you never miss a statutory deadline',
    ],
    whoThisIsFor:
      'Businesses that want a single, accountable point of contact for all tax and accounting compliance, rather than juggling separate vendors for GST, income tax, and bookkeeping.',
    ourApproach:
      'We start with a compliance health check of your current filings, flag any gaps or exposure, then set up a recurring compliance calendar so every deadline (GST, TDS, advance tax, annual returns) is tracked and filed on time.',
    faqs: [
      {
        question: 'Do you handle both GST and income tax compliance together?',
        answer:
          'Yes. We manage direct and indirect tax compliance as one integrated service, so nothing falls through the cracks between the two.',
      },
      {
        question: 'Can you take over accounting for a business currently behind on filings?',
        answer:
          'Yes. We routinely run compliance health checks for businesses catching up on backlog filings and build a remediation plan alongside regular ongoing compliance.',
      },
      {
        question: 'Do you work with businesses outside Noida?',
        answer:
          'Yes, we support clients across India and internationally; most compliance work is handled remotely with periodic calls or in-person meetings as needed.',
      },
    ],
    relatedLinks: [
      { slug: 'startup-msme-advisory', label: 'startup and MSME advisory' },
      { slug: 'corporate-secretarial', label: 'corporate secretarial compliance' },
    ],
  },
  {
    slug: 'corporate-restructuring',
    listTitle: 'Corporate Restructuring & Due Diligence',
    linkLabel: 'Learn about restructuring and due diligence',
    title: 'Corporate Restructuring & Due Diligence Services',
    seoTitle: 'Corporate Restructuring & Due Diligence Services | Teotia',
    metaDescription:
      'Business restructuring, valuation & due diligence support for companies navigating reorganization, transactions, or growth. Advisory from Teotia & Co.',
    tagline: 'Restructuring, diligence, and valuation before you commit',
    duration: 'By engagement',
    price: 'On request',
    priceLabel: 'Fees on request',
    shortDescription:
      'Business restructuring, valuation, and due diligence support for reorganizations, transactions, and growth decisions.',
    features: [
      'Corporate restructuring and reorganizations',
      'Financial and tax due diligence',
      'Business valuation assignments',
    ],
    intro:
      'Restructuring a business, whether for tax efficiency, ownership changes, or ahead of a transaction, requires careful evaluation before any structural change is made. Teotia & Co. provides restructuring, due diligence, and valuation support for companies managing reorganizations and growth-stage decisions.',
    whatsIncluded: [
      'Corporate restructuring and business reorganization advisory',
      'Financial and tax due diligence for transactions and internal reviews',
      'Business valuation for transactions, disputes, or regulatory purposes',
      'Risk assessment during restructuring or ownership changes',
      'Advisory on regulatory and tax implications of restructuring options',
    ],
    whoThisIsFor:
      'Businesses evaluating a restructuring, considering a transaction, or needing an independent due diligence/valuation exercise before making a significant structural decision.',
    faqs: [
      {
        question: 'When does a business typically need a due diligence exercise?',
        answer:
          'Common triggers include upcoming transactions, fundraising rounds, ownership changes, or as part of periodic internal risk review.',
      },
      {
        question: 'What\'s included in a business valuation engagement?',
        answer:
          'Scope depends on purpose (transaction, dispute, or regulatory). We scope the valuation approach and methodology with you before starting the engagement.',
      },
    ],
    relatedLinks: [
      { slug: 'ma-transaction-advisory', label: 'M&A and transaction advisory' },
      { slug: 'taxation-accounting', label: 'taxation and compliance support' },
    ],
  },
];

export const SERVICE_TITLES = services.map((service) => service.title);

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return services.map((service) => service.slug);
}

const BASE_URL = 'https://www.teotiaco.com';

export function buildServicesHubSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/services#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: `${BASE_URL}/services`,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}/services#webpage`,
        url: `${BASE_URL}/services`,
        name: 'CA & Corporate Advisory Services',
        description:
          'Taxation, incorporation, corporate compliance, FDI/FEMA, M&A, and startup advisory for businesses across India.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${BASE_URL}/#organization` },
        hasPart: {
          '@type': 'ItemList',
          itemListElement: services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${BASE_URL}/services/${service.slug}`,
            name: service.listTitle,
          })),
        },
      },
    ],
  };
}

export function buildServiceFaqSchema(faqs: ServiceFaq[], path: string): object | null {
  if (faqs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE_URL}${path}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
