'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from '@/lib/toast';

export function FlashToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const info = searchParams.get('info');

    if (success) {
      toast.success(success);
      cleanUrl();
    } else if (error) {
      toast.error(error);
      cleanUrl();
    } else if (info) {
      toast.info(info);
      cleanUrl();
    }
  }, [searchParams]);

  return null;
}

function cleanUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.delete('info');
  window.history.replaceState(null, '', url.toString());
}
