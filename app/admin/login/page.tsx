'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';

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
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Sign in to manage blogs, comments, and enquiries.</p>

        {error && <div className="admin-error">{error}</div>}

        {!otpStep ? (
          <form onSubmit={handleLogin} className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="otp">One-time password</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleResendOtp}
            >
              Resend OTP
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setOtpStep(false);
                setOtp('');
              }}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
