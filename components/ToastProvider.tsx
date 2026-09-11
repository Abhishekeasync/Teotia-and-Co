'use client';

import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MAX_VISIBLE_TOASTS, markToastUiReady } from '@/lib/toast-config';

export function ToastProvider() {
  useEffect(() => {
    markToastUiReady();
  }, []);

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      draggable
      pauseOnHover
      theme="colored"
      limit={MAX_VISIBLE_TOASTS}
    />
  );
}
