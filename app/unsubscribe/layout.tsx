import type { Metadata } from 'next';
import { NOINDEX_ROBOTS } from '@/lib/metadata';

export const metadata: Metadata = {
  title: 'Unsubscribe | TEOTIA & CO.',
  robots: NOINDEX_ROBOTS,
};

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
