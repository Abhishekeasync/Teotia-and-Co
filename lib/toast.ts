'use client';

import type { ReactNode } from 'react';
import type { ToastOptions, TypeOptions } from 'react-toastify';
import {
  DEFAULT_TOAST_AUTO_CLOSE_MS,
  requestToastUi,
  toastUiReady,
} from '@/lib/toast-config';

type ToastContent = string | ReactNode;

type ToastifyModule = typeof import('react-toastify');

let toastifyPromise: Promise<ToastifyModule> | null = null;

function loadToastify() {
  if (!toastifyPromise) {
    requestToastUi();
    toastifyPromise = import('react-toastify');
  }
  return toastifyPromise;
}

export { MAX_VISIBLE_TOASTS } from '@/lib/toast-config';

function resolveAutoClose(options?: ToastOptions): number | false {
  if (options?.autoClose === false) return false;
  if (typeof options?.autoClose === 'number') return options.autoClose;
  return DEFAULT_TOAST_AUTO_CLOSE_MS;
}

function toastKey(type: TypeOptions, message: string) {
  return `${type}:${message}`;
}

async function show(
  type: 'success' | 'error' | 'info',
  message: ToastContent,
  options?: ToastOptions,
) {
  const { toast: toastify } = await loadToastify();
  await Promise.race([
    toastUiReady,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2000);
    }),
  ]);
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
    void show('success', message, options);
  },
  error(message: ToastContent, options?: ToastOptions) {
    void show('error', message, options);
  },
  info(message: ToastContent, options?: ToastOptions) {
    void show('info', message, options);
  },
  message(message: ToastContent, options?: ToastOptions) {
    void show('info', message, options);
  },
};
