import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms of Service',
  description:
    'Terms governing use of the TEOTIA & CO. website, newsletter, and online enquiries. Professional CA and advisory services are provided only under separate engagement terms.',
  path: '/terms-of-service',
  keywords: [
    'terms of service TEOTIA & CO',
    'website terms CA firm',
    'chartered accountants Noida terms',
    'professional services disclaimer',
  ],
});

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
