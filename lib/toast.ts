'use client';

import type { ReactNode } from 'react';
import {
  toast as toastify,
  type ToastOptions,
} from 'react-toastify';

type ToastContent = string | ReactNode;

export const toast = {
  success(message: ToastContent, options?: ToastOptions) {
    toastify.success(message, options);
  },
  error(message: ToastContent, options?: ToastOptions) {
    toastify.error(message, options);
  },
  info(message: ToastContent, options?: ToastOptions) {
    toastify.info(message, options);
  },
  message(message: ToastContent, options?: ToastOptions) {
    toastify.info(message, options);
  },
};
