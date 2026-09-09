const BASE_URL = 'https://www.teotiaco.com';

/** ISO date for schema and sitemap — update when legal copy changes. */
export const LEGAL_LAST_UPDATED = '2026-09-09';

export const LEGAL_LAST_UPDATED_DISPLAY = 'September 9, 2026';

type LegalPageSchemaConfig = {
  name: string;
  path: string;
  description: string;
};

export function buildLegalPageSchema(config: LegalPageSchemaConfig): object {
  const url = `${BASE_URL}${config.path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
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
            name: config.name,
            item: url,
          },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: config.name,
        description: config.description,
        dateModified: LEGAL_LAST_UPDATED,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${BASE_URL}/#organization` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
    ],
  };
}
