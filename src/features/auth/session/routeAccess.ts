import type { Href } from 'expo-router';

/** Entrada de quem não tem sessão. */
const LOGIN_ROUTE: Href = '/login';

/** Entrada de quem tem sessão e já passou pelo onboarding. */
export const HOME_ROUTE: Href = '/';

/** Entrada de quem tem sessão mas ainda não passou pelo onboarding. */
export const ONBOARDING_FIRST_STEP_ROUTE: Href = '/onboarding/etapa-1';

/**
 * Abertas sem sessão: o apoio oferece a respiração.
 * Com sessão e onboarding pendente, essas rotas também voltam para o onboarding.
 */
const PUBLIC_ROUTES = ['/apoio', '/respiracao'];

/** Telas de entrada: só fazem sentido para quem ainda não entrou. */
const GUEST_ONLY_ROUTES = ['/welcome', '/login', '/cadastro'];

type SessionAccess = {
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
};

function isOnboardingPath(pathname: string): boolean {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/');
}

/**
 * Destino do redirecionamento, ou `null` quando a rota pode ficar.
 * Sem sessão, só Welcome, login, cadastro e as rotas públicas ficam.
 * Com sessão e onboarding pendente, só o fluxo de onboarding fica.
 * Com sessão e onboarding concluído, Welcome, login, cadastro e onboarding voltam para a Home.
 */
export function resolveRedirect(pathname: string, session: SessionAccess): Href | null {
  const isGuestRoute = GUEST_ONLY_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const inOnboarding = isOnboardingPath(pathname);

  if (!session.isAuthenticated) {
    if (isGuestRoute || isPublicRoute) {
      return null;
    }

    return LOGIN_ROUTE;
  }

  if (!session.onboardingCompleted) {
    return inOnboarding ? null : ONBOARDING_FIRST_STEP_ROUTE;
  }

  if (isGuestRoute || inOnboarding) {
    return HOME_ROUTE;
  }

  return null;
}
