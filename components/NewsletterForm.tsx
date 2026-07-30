'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
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
    <form className={className} onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your email address"
        aria-label="Email address for newsletter"
        maxLength={255}
        disabled={loading}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
