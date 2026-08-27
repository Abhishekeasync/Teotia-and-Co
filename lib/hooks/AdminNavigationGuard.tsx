'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { UnsavedChangesDialog } from '@/components/admin/UnsavedChangesDialog';

const BROWSER_BACK_TOKEN = '__browser_back__';
const INTERACTION_TIMEOUT = 100;
const DIRTY_CHECK_INTERVAL = 250;
const LEAVING_RESET_DELAY = 300;

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
  
  // State refs - using refs for values that shouldn't trigger re-renders
  const guardsRef = useRef<NavigationGuard[]>([]);
  const leavingRef = useRef(false);
  const historyTrapActiveRef = useRef(false);
  const isInteractingRef = useRef(false);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dialog state
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [activeGuardId, setActiveGuardId] = useState<string | null>(null);
  const [hasDirtyGuard, setHasDirtyGuard] = useState(false);

  // Guard management
  const registerGuard = useCallback((guard: NavigationGuard) => {
    guardsRef.current = [...guardsRef.current.filter((g) => g.id !== guard.id), guard];
  }, []);

  const unregisterGuard = useCallback((id: string) => {
    guardsRef.current = guardsRef.current.filter((g) => g.id !== id);
  }, []);

  const findDirtyGuard = useCallback((): NavigationGuard | undefined => {
    return guardsRef.current.find((guard) => guard.isDirty());
  }, []);

  // Periodically sync dirty state
  useEffect(() => {
    const syncDirty = () => {
      if (leavingRef.current) return;
      setHasDirtyGuard(Boolean(findDirtyGuard()));
    };
    
    syncDirty(); // Initial check
    const interval = setInterval(syncDirty, DIRTY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [findDirtyGuard]);

  // Dialog management
  const openGuardDialog = useCallback((href: string, guard: NavigationGuard) => {
    setPendingHref(href);
    setActiveGuardId(guard.id);
  }, []);

  const closeDialog = useCallback(() => {
    setPendingHref(null);
    setActiveGuardId(null);
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

  // Interaction tracking - prevents false positives on button clicks
  const markInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    
    // Clear any existing timer
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
  }, []);

  const markInteractionEnd = useCallback(() => {
    // Delay reset to ensure beforeunload check completes
    interactionTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      interactionTimerRef.current = null;
    }, INTERACTION_TIMEOUT);
  }, []);

  // Navigation guards and event listeners
  useEffect(() => {
    if (!hasDirtyGuard) {
      historyTrapActiveRef.current = false;
      return;
    }

    // Prevent tab close/refresh when dirty
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Skip if: leaving, no guards, or user is actively interacting
      if (leavingRef.current || !findDirtyGuard() || isInteractingRef.current) {
        return;
      }
      
      event.preventDefault();
      event.returnValue = ''; // Modern browsers ignore custom messages
    };

    // Handle browser back button
    const handlePopState = () => {
      if (leavingRef.current) return;

      const dirtyGuard = findDirtyGuard();
      if (!dirtyGuard) return;

      // Re-push state to trap the back action
      history.pushState({ unsavedGuard: true }, '', window.location.href);
      openGuardDialog(BROWSER_BACK_TOKEN, dirtyGuard);
    };

    // Initialize history trap
    if (!historyTrapActiveRef.current) {
      history.pushState({ unsavedGuard: true }, '', window.location.href);
      historyTrapActiveRef.current = true;
    }

    // Register event listeners
    const listenerOptions = { capture: true, passive: true };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('click', markInteractionStart, listenerOptions);
    window.addEventListener('click', markInteractionEnd);
    window.addEventListener('submit', markInteractionStart, listenerOptions);
    window.addEventListener('submit', markInteractionEnd);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click', markInteractionStart, listenerOptions);
      window.removeEventListener('click', markInteractionEnd);
      window.removeEventListener('submit', markInteractionStart, listenerOptions);
      window.removeEventListener('submit', markInteractionEnd);
      
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, [hasDirtyGuard, findDirtyGuard, openGuardDialog, markInteractionStart, markInteractionEnd]);

  // Dialog action handlers
  const handleContinue = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const handleReset = useCallback(() => {
    const guard = guardsRef.current.find((g) => g.id === activeGuardId);
    if (guard) {
      guard.reset();
    }
    closeDialog();
  }, [activeGuardId, closeDialog]);

  const handleLeave = useCallback(() => {
    if (!pendingHref) return;

    const guard = guardsRef.current.find((g) => g.id === activeGuardId);

    // Mark as leaving to bypass guards
    leavingRef.current = true;
    setHasDirtyGuard(false);

    // Discard changes
    if (guard) {
      guard.discard();
    }
    
    closeDialog();

    // Navigate
    if (pendingHref === BROWSER_BACK_TOKEN) {
      history.go(-2); // Pop trap + current = go back
    } else {
      router.replace(pendingHref);
    }

    // Reset leaving flag after navigation completes
    setTimeout(() => {
      leavingRef.current = false;
    }, LEAVING_RESET_DELAY);
  }, [pendingHref, activeGuardId, closeDialog, router]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      registerGuard,
      unregisterGuard,
      requestNavigation,
      navigateWithoutGuard,
    }),
    [registerGuard, unregisterGuard, requestNavigation, navigateWithoutGuard]
  );

  return (
    <AdminNavigationGuardContext.Provider value={contextValue}>
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
