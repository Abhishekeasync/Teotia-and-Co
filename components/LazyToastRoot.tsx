'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { TOAST_UI_REQUEST_EVENT } from '@/lib/toast-config';

const ToastProvider = dynamic(
  () => import('@/components/ToastProvider').then((mod) => mod.ToastProvider),
  { ssr: false },
);

export function LazyToastRoot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = () => setReady(true);

    window.addEventListener(TOAST_UI_REQUEST_EVENT, mount);

    const useIdleCallback = typeof window.requestIdleCallback === 'function';
    const idleId = useIdleCallback
      ? window.requestIdleCallback(mount, { timeout: 4000 })
      : window.setTimeout(mount, 2500);

    return () => {
      window.removeEventListener(TOAST_UI_REQUEST_EVENT, mount);
      if (useIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <ToastProvider />;
}
