import {
  HOME_ROUTE,
  ONBOARDING_FIRST_STEP_ROUTE,
  WELCOME_ROUTE,
  resolveRedirect,
} from '@/features/auth/session/routeAccess';

const guest = { isAuthenticated: false, onboardingCompleted: false };
const pendingOnboarding = { isAuthenticated: true, onboardingCompleted: false };
const member = { isAuthenticated: true, onboardingCompleted: true };

describe('resolveRedirect', () => {
  describe('sem sessão', () => {
    it.each(['/welcome', '/login', '/cadastro', '/confirmar-email', '/esqueci-senha'])(
      'deixa ficar na rota de entrada %s',
      (pathname) => {
        expect(resolveRedirect(pathname, guest)).toBeNull();
      },
    );

    it.each(['/apoio', '/respiracao'])('deixa ficar na rota pública %s', (pathname) => {
      expect(resolveRedirect(pathname, guest)).toBeNull();
    });

    it.each(['/', '/diario', '/onboarding/etapa-1', '/perfil'])(
      'manda %s para a Welcome',
      (pathname) => {
        expect(resolveRedirect(pathname, guest)).toBe(WELCOME_ROUTE);
      },
    );
  });

  describe('com sessão e onboarding pendente', () => {
    it.each(['/onboarding', '/onboarding/etapa-2'])('deixa ficar no onboarding %s', (pathname) => {
      expect(resolveRedirect(pathname, pendingOnboarding)).toBeNull();
    });

    it.each(['/', '/apoio', '/login', '/onboardingx'])('manda %s para a etapa 1', (pathname) => {
      expect(resolveRedirect(pathname, pendingOnboarding)).toBe(ONBOARDING_FIRST_STEP_ROUTE);
    });
  });

  describe('com sessão e onboarding concluído', () => {
    it.each(['/welcome', '/login', '/cadastro', '/onboarding/etapa-3'])(
      'manda %s para a Home',
      (pathname) => {
        expect(resolveRedirect(pathname, member)).toBe(HOME_ROUTE);
      },
    );

    it.each(['/', '/diario', '/apoio', '/perfil'])('deixa ficar em %s', (pathname) => {
      expect(resolveRedirect(pathname, member)).toBeNull();
    });
  });
});
