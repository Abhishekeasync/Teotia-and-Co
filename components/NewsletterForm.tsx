'use client';

import { FormEvent, useState } from 'react';
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr';
import { toast } from '@/lib/toast';
import { publicApi, ApiClientError } from '@/lib/api/client';
import { validateEmail } from '@/lib/validation';

type NewsletterFormProps = {
  source?: string;
  className?: string;
};

export default function NewsletterForm({ source = 'footer', className = 'footer-newsletter' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    setLoading(true);

    try {
      await publicApi.subscribers.subscribe({
        email: email.trim().toLowerCase(),
        name: source === 'footer' ? 'Newsletter subscriber' : undefined,
      });

      toast.success('Thank you for subscribing! Check your inbox for updates.');
      setEmail('');
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : 'Failed to subscribe. Please try again.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={className}
      onSubmit={handleSubmit}
      aria-busy={loading}
      suppressHydrationWarning
    >
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="your@email.com"
        aria-label="Email address for newsletter"
        autoComplete="email"
        inputMode="email"
        maxLength={255}
        disabled={loading}
        required
        suppressHydrationWarning
      />
      <button
        type="submit"
        disabled={loading}
        aria-label={loading ? 'Subscribing' : 'Subscribe'}
        suppressHydrationWarning
      >
        <span className="footer-newsletter-label">{loading ? 'Subscribing' : 'Subscribe'}</span>
        <PaperPlaneTilt size={16} weight="bold" aria-hidden="true" />
      </button>
    </form>
  );
}
