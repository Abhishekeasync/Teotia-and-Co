import { Metadata } from 'next';
import { SchemaOrg } from '@/components/SchemaOrg';
import { buildServicesHubSchema } from '@/lib/services';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'CA Services in India | Tax & Compliance',
  description:
    'Expert CA services across India: GST, income tax, incorporation, FDI/FEMA, M&A, corporate compliance and startup advisory. Book a consultation.',
  path: '/services',
  keywords: [
    'CA services Noida',
    'taxation services',
    'GST compliance',
    'income tax advisory',
    'corporate compliance',
    'FDI FEMA advisory',
    'company incorporation',
    'M&A advisory',
    'business restructuring',
    'IPR protection',
    'startup advisory',
  ],
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SchemaOrg schema={buildServicesHubSchema()} />
      {children}
    </>
  );
}
