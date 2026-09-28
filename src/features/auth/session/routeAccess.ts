import type { Href } from 'expo-router';

/** Entrada de quem não tem sessão. */
const WELCOME_ROUTE: Href = '/welcome';

/** Entrada de quem tem sessão e já passou pelo onboarding. */
export const HOME_ROUTE: Href = '/';

/** Entrada de quem tem sessão mas ainda não passou pelo onboarding. */
export const ONBOARDING_FIRST_STEP_ROUTE: Href = '/onboarding/etapa-1';

/** Etapas do onboarding: as únicas telas internas liberadas antes de concluí-lo. */
const ONBOARDING_ROUTE_PREFIX = '/onboarding/';

/** Abertas com e sem sessão: a Welcome leva ao apoio, que oferece a respiração. */
const PUBLIC_ROUTES = ['/apoio', '/respiracao'];

/** Telas de entrada: só fazem sentido para quem ainda não entrou. */
const GUEST_ONLY_ROUTES = ['/welcome', '/login', '/cadastro'];

type SessionAccess = {
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
};

/**
 * Destino do redirecionamento, ou `null` quando a rota pode ficar. Nega por
 * padrão: tela fora das listas exige sessão e onboarding concluído. Quem já
 * concluiu o onboarding é barrado em `app/onboarding/_layout.tsx`.
 */
export function resolveRedirect(pathname: string, session: SessionAccess): Href | null {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  if (GUEST_ONLY_ROUTES.includes(pathname)) {
    if (!session.isAuthenticated) {
      return null;
    }

    return session.onboardingCompleted ? HOME_ROUTE : ONBOARDING_FIRST_STEP_ROUTE;
  }

  if (!session.isAuthenticated) {
    return WELCOME_ROUTE;
  }

  if (!session.onboardingCompleted && !pathname.startsWith(ONBOARDING_ROUTE_PREFIX)) {
    return ONBOARDING_FIRST_STEP_ROUTE;
  }

  return null;
}
