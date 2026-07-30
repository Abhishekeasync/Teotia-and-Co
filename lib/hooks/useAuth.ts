/**
 * Authentication hook for admin pages
 * Manages login state and provides auth methods
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, ApiClientError } from '../api/client';
import { ApiAdmin } from '../api/types';

interface AuthState {
  admin: ApiAdmin | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    admin: null,
    loading: true,
    error: null,
  });

  // Check if user is authenticated on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await adminApi.auth.me();
      setState({
        admin: (response as any).data.admin,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        admin: null,
        loading: false,
        error: null, // Silent fail for auth check
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login method
  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await adminApi.auth.login({ email, password });
      const data = response as any;

      if (data.data.otpRequired) {
        setState((prev) => ({ ...prev, loading: false }));
        return { otpRequired: true };
      }

      setState({
        admin: data.data.admin,
        loading: false,
        error: null,
      });

      return { otpRequired: false };
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Login failed. Please try again.';

      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  };

  // Verify OTP method
  const verifyOtp = async (email: string, otp: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await adminApi.auth.verifyOtp({ email, otp });
      const data = response as any;

      setState({
        admin: data.data.admin,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'OTP verification failed. Please try again.';

      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  };

  // Resend OTP method
  const resendOtp = async (email: string) => {
    try {
      await adminApi.auth.resendOtp({ email });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Failed to resend OTP. Please try again.';

      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await adminApi.auth.logout();
      setState({
        admin: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      // Even if API call fails, clear local state
      setState({
        admin: null,
        loading: false,
        error: null,
      });
    }
  };

  return {
    admin: state.admin,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.admin,
    login,
    verifyOtp,
    resendOtp,
    logout,
    refresh: checkAuth,
  };
}
