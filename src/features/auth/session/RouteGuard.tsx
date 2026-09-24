import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSession } from '@/features/auth/session/SessionContext';
import { resolveRedirect } from '@/features/auth/session/routeAccess';
import { colors } from '@/theme';

/** Aplica `routeAccess` a cada mudança de rota, depois que o navegador raiz existe. */
export function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const navigationState = useRootNavigationState();

  const isNavigationReady = navigationState?.key != null;
  const destination = resolveRedirect(pathname, {
    isAuthenticated: session.isAuthenticated,
    onboardingCompleted: session.user?.onboardingCompleted ?? false,
  });

  useEffect(() => {
    if (isNavigationReady && destination !== null) {
      router.replace(destination);
    }
  }, [destination, isNavigationReady, pathname, router]);

  // O redirecionamento só roda depois da pintura; até lá, a rota barrada fica coberta.
  return destination === null ? null : <View style={styles.cover} />;
}

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
});
