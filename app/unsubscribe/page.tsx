import Link from 'next/link';
import { publicApi, ApiClientError } from '@/lib/api/client';
import '../page-styles.css';

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          <h1 style={{ color: 'var(--heading-color)', marginBottom: '1rem' }}>
            Invalid unsubscribe link
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            This link is missing a token. Please use the link from your newsletter email.
          </p>
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  let success = false;
  let message = '';

  try {
    const response = await publicApi.subscribers.unsubscribe(token);
    const data = response as { message?: string };
    success = true;
    message = data.message || 'You have been unsubscribed successfully.';
  } catch (error) {
    message =
      error instanceof ApiClientError
        ? error.message
        : 'Unable to process your unsubscribe request. The link may have expired.';
  }

  return (
    <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <h1 style={{ color: 'var(--heading-color)', marginBottom: '1rem' }}>
          {success ? 'Unsubscribed' : 'Unsubscribe failed'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {message}
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
