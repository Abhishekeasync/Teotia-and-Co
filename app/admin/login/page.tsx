'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { useAuth } from '@/lib/hooks/useAuth';

const LOGO_SRC = '/assets/images/Teotia-and-co-Logo.png';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, verifyOtp, resendOtp, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await login(email.trim(), password);
      if (result.otpRequired) {
        setOtpStep(true);
        toast.info('Enter the OTP sent to your email');
      } else {
        toast.success('Welcome back');
        router.push('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await verifyOtp(email.trim(), otp.trim());
      toast.success('Signed in successfully');
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email.trim());
      toast.success('OTP resent');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend OTP');
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <Link href="/" className="admin-login-logo-wrap" aria-label="Teotia & Co. home">
            <Image
              src={LOGO_SRC}
              alt="Teotia & Co."
              className="admin-login-logo"
              width={160}
              height={55}
              priority
            />
          </Link>
          <p className="admin-login-brand-tagline">
            Content admin for blogs, comments, subscribers, and client enquiries.
          </p>
          <ul className="admin-login-features">
            <li>Publish and manage blog posts</li>
            <li>Moderate reader comments</li>
            <li>Review contact form submissions</li>
          </ul>
        </div>
      </div>

      <div className="admin-login-panel">
        <div className="admin-login-card">
          <Link href="/" className="admin-login-mobile-brand">
            <span className="admin-login-logo-wrap admin-login-logo-wrap--compact">
              <Image
                src={LOGO_SRC}
                alt=""
                className="admin-login-logo"
                width={120}
                height={41}
                priority
              />
            </span>
          </Link>

          <div className="admin-login-card-header">
            <h1>{otpStep ? 'Check your email' : 'Sign in'}</h1>
            <p className="admin-login-card-desc">
              {otpStep
                ? 'Enter the verification code we sent to complete sign-in.'
                : 'Administrator access only. Use your assigned credentials.'}
            </p>
          </div>

          {error && <div className="admin-error">{error}</div>}

          {!otpStep ? (
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="admin-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="admin-btn admin-btn-primary admin-login-submit"
                disabled={submitting}
              >
                {submitting ? 'Signing in…' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="admin-login-form">
              <p className="admin-login-email-hint">
                Code sent to <strong>{email}</strong>
              </p>
              <div className="admin-field">
                <label htmlFor="otp">Verification code</label>
                <input
                  id="otp"
                  type="text"
                  className="admin-login-otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                className="admin-btn admin-btn-primary admin-login-submit"
                disabled={submitting || otp.length < 6}
              >
                {submitting ? 'Verifying…' : 'Verify and sign in'}
              </button>
              <div className="admin-login-secondary-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleResendOtp}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setOtpStep(false);
                    setOtp('');
                    setError(null);
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          <div className="admin-login-footer">
            <Link href="/">← Back to website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
