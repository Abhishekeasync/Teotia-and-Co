import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description:
    'How TEOTIA & CO. collects, uses, stores, and protects personal data on teotiaco.com — including contact enquiries, newsletter subscriptions, and job applications — in line with India’s DPDP Act, 2023.',
  path: '/privacy-policy',
  keywords: [
    'privacy policy TEOTIA & CO',
    'data protection India',
    'DPDP Act 2023',
    'CA firm privacy Noida',
    'personal data policy',
  ],
});

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
