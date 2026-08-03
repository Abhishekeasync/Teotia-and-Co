'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { UnsavedChangesDialog } from '@/components/admin/UnsavedChangesDialog';

const BROWSER_BACK_TOKEN = '__browser_back__';

type NavigationGuard = {
  id: string;
  isDirty: () => boolean;
  reset: () => void;
  discard: () => void;
};

type AdminNavigationGuardContextValue = {
  registerGuard: (guard: NavigationGuard) => void;
  unregisterGuard: (id: string) => void;
  requestNavigation: (href: string) => void;
  navigateWithoutGuard: (href: string) => void;
};

const AdminNavigationGuardContext =
  createContext<AdminNavigationGuardContextValue | null>(null);

export function AdminNavigationGuardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const guardsRef = useRef<NavigationGuard[]>([]);
  const leavingRef = useRef(false);
  const historyTrapActiveRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);
  const activeGuardIdRef = useRef<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const registerGuard = useCallback((guard: NavigationGuard) => {
    guardsRef.current = guardsRef.current.filter((g) => g.id !== guard.id);
    guardsRef.current.push(guard);
  }, []);

  const unregisterGuard = useCallback((id: string) => {
    guardsRef.current = guardsRef.current.filter((g) => g.id !== id);
  }, []);

  const findDirtyGuard = useCallback(() => {
    return guardsRef.current.find((guard) => guard.isDirty());
  }, []);

  const [hasDirtyGuard, setHasDirtyGuard] = useState(false);

  useEffect(() => {
    const syncDirty = () => {
      if (leavingRef.current) return;
      setHasDirtyGuard(Boolean(findDirtyGuard()));
    };
    syncDirty();
    const interval = window.setInterval(syncDirty, 250);
    return () => window.clearInterval(interval);
  }, [findDirtyGuard]);

  const openGuardDialog = useCallback((href: string, guard: NavigationGuard) => {
    pendingHrefRef.current = href;
    activeGuardIdRef.current = guard.id;
    setPendingHref(href);
  }, []);

  const closeDialog = useCallback(() => {
    pendingHrefRef.current = null;
    activeGuardIdRef.current = null;
    setPendingHref(null);
  }, []);

  const navigateWithoutGuard = useCallback(
    (href: string) => {
      router.replace(href);
    },
    [router]
  );

  const requestNavigation = useCallback(
    (href: string) => {
      const dirtyGuard = findDirtyGuard();
      if (dirtyGuard) {
        openGuardDialog(href, dirtyGuard);
        return;
      }
      router.replace(href);
    },
    [findDirtyGuard, openGuardDialog, router]
  );

  useEffect(() => {
    if (!hasDirtyGuard) {
      historyTrapActiveRef.current = false;
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (leavingRef.current || !findDirtyGuard()) return;
      event.preventDefault();
      event.returnValue = '';
    };

    const onPopState = () => {
      if (leavingRef.current) return;

      const dirtyGuard = findDirtyGuard();
      if (!dirtyGuard) return;

      history.pushState({ unsavedGuard: true }, '', window.location.href);
      openGuardDialog(BROWSER_BACK_TOKEN, dirtyGuard);
    };

    if (!historyTrapActiveRef.current) {
      history.pushState({ unsavedGuard: true }, '', window.location.href);
      historyTrapActiveRef.current = true;
    }

    window.addEventListener('popstate', onPopState);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [hasDirtyGuard, findDirtyGuard, openGuardDialog]);

  const handleContinue = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const handleReset = useCallback(() => {
    const guard = guardsRef.current.find(
      (g) => g.id === activeGuardIdRef.current
    );
    if (guard) guard.reset();
    closeDialog();
  }, [closeDialog]);

  const handleLeave = useCallback(() => {
    const href = pendingHrefRef.current;
    if (!href) return;

    const guard = guardsRef.current.find(
      (g) => g.id === activeGuardIdRef.current
    );

    leavingRef.current = true;
    setHasDirtyGuard(false);

    if (guard) guard.discard();
    closeDialog();

    if (href === BROWSER_BACK_TOKEN) {
      // Pop trap sentinel + current entry to reach the previous page.
      history.go(-2);
    } else {
      router.replace(href);
    }

    window.setTimeout(() => {
      leavingRef.current = false;
    }, 300);
  }, [closeDialog, router]);

  return (
    <AdminNavigationGuardContext.Provider
      value={{
        registerGuard,
        unregisterGuard,
        requestNavigation,
        navigateWithoutGuard,
      }}
    >
      {children}
      <UnsavedChangesDialog
        open={pendingHref !== null}
        onContinue={handleContinue}
        onReset={handleReset}
        onLeave={handleLeave}
      />
    </AdminNavigationGuardContext.Provider>
  );
}

export function useAdminNavigationGuard() {
  const ctx = useContext(AdminNavigationGuardContext);
  if (!ctx) {
    throw new Error('useAdminNavigationGuard must be used within AdminNavigationGuardProvider');
  }
  return ctx;
}

type UseRegisterNavigationGuardOptions = {
  enabled?: boolean;
  isDirty: () => boolean;
  reset: () => void;
  discard: () => void;
};

export function useRegisterNavigationGuard({
  enabled = true,
  isDirty,
  reset,
  discard,
}: UseRegisterNavigationGuardOptions) {
  const { registerGuard, unregisterGuard } = useAdminNavigationGuard();
  const id = useId();
  const handlersRef = useRef({ isDirty, reset, discard });
  handlersRef.current = { isDirty, reset, discard };

  useEffect(() => {
    if (!enabled) return;

    const guard: NavigationGuard = {
      id,
      isDirty: () => handlersRef.current.isDirty(),
      reset: () => handlersRef.current.reset(),
      discard: () => handlersRef.current.discard(),
    };

    registerGuard(guard);
    return () => unregisterGuard(id);
  }, [enabled, id, registerGuard, unregisterGuard]);
}
