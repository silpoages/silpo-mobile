import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/SessionContext';
import { resolveRedirect } from '@/features/auth/session/routeAccess';

/** Aplica `routeAccess` a cada mudança de rota, depois que o navegador raiz existe. */
export function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const navigationState = useRootNavigationState();

  const isNavigationReady = navigationState?.key != null;
  const onboardingCompleted = session.user?.onboardingCompleted ?? false;

  useEffect(() => {
    if (!isNavigationReady) {
      return;
    }

    const destination = resolveRedirect(pathname, {
      isAuthenticated: session.isAuthenticated,
      onboardingCompleted,
    });

    if (destination !== null) {
      router.replace(destination);
    }
  }, [isNavigationReady, onboardingCompleted, pathname, router, session.isAuthenticated]);

  return null;
}
