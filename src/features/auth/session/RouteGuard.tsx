import { Redirect, usePathname, useRootNavigationState } from 'expo-router';

import { useSession } from '@/features/auth/session/SessionContext';
import { resolveRedirect } from '@/features/auth/session/routeAccess';

/**
 * Manda a rota atual para o destino de `routeAccess`.
 * O redirecionamento acontece no render, para a Home não aparecer antes da Welcome.
 */
export function RouteGuard() {
  const pathname = usePathname();
  const session = useSession();
  const navigationState = useRootNavigationState();

  if (navigationState?.key == null) {
    return null;
  }

  const destination = resolveRedirect(pathname, {
    isAuthenticated: session.isAuthenticated,
    onboardingCompleted: session.user?.onboardingCompleted ?? false,
  });

  if (destination === null) {
    return null;
  }

  return <Redirect href={destination} />;
}
