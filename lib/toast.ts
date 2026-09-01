'use client';

import type { ReactNode } from 'react';
import {
  toast as toastify,
  type ToastOptions,
  type TypeOptions,
} from 'react-toastify';

type ToastContent = string | ReactNode;

export const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_AUTO_CLOSE_MS = 4000;

function resolveAutoClose(options?: ToastOptions): number | false {
  if (options?.autoClose === false) return false;
  if (typeof options?.autoClose === 'number') return options.autoClose;
  return DEFAULT_AUTO_CLOSE_MS;
}

function toastKey(type: TypeOptions, message: string) {
  return `${type}:${message}`;
}

function show(
  type: 'success' | 'error' | 'info',
  message: ToastContent,
  options?: ToastOptions,
) {
  const autoClose = resolveAutoClose(options);

  if (typeof message === 'string') {
    const toastId = options?.toastId ?? toastKey(type, message);

    if (toastify.isActive(toastId)) {
      toastify.update(toastId, {
        render: message,
        type,
        autoClose,
      });
      toastify.clearWaitingQueue();
      return toastId;
    }

    return toastify[type](message, { ...options, toastId, autoClose });
  }

  return toastify[type](message, options);
}

export const toast = {
  success(message: ToastContent, options?: ToastOptions) {
    show('success', message, options);
  },
  error(message: ToastContent, options?: ToastOptions) {
    show('error', message, options);
  },
  info(message: ToastContent, options?: ToastOptions) {
    show('info', message, options);
  },
  message(message: ToastContent, options?: ToastOptions) {
    show('info', message, options);
  },
};
