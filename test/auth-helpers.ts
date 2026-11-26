import type { SessionUser } from '@/features/auth/session/SessionContext';
import type { SignInResult } from '@/features/auth/services/authService';

/** Usuário de sessão padrão para os testes de autenticação. */
export function makeSessionUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 'u1',
    email: 'ana@silpo.com',
    fullName: 'Ana',
    role: 'USER',
    onboardingCompleted: false,
    ...overrides,
  };
}

export function makeSignInResult(
  overrides: { isEmailConfirmed?: boolean; user?: Partial<SessionUser> } = {},
): SignInResult {
  return {
    token: 'tok-123',
    user: makeSessionUser(overrides.user),
    isEmailConfirmed: overrides.isEmailConfirmed ?? true,
  };
}

/** Valor de `useSession()` com `login`/`logout` espionáveis. */
export function makeSessionValue(
  overrides: Partial<{ isAuthenticated: boolean; user: SessionUser | null }> = {},
) {
  const isAuthenticated = overrides.isAuthenticated ?? false;
  return {
    token: isAuthenticated ? 'tok' : null,
    user: overrides.user ?? null,
    isAuthenticated,
    isLoading: false,
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
  };
}
