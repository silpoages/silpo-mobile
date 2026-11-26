/** Helpers dos testes de onboarding/perfil/notificações (área "onboarding"). */
import { useEffect, useState, type ReactNode } from 'react';

import type { SessionUser } from '@/features/auth/session/SessionContext';
import { OnboardingProvider, useOnboarding } from '@/features/onboarding/OnboardingContext';

type OnboardingState = ReturnType<typeof useOnboarding>;

function Seed({ seed, children }: { seed: (state: OnboardingState) => void; children: ReactNode }) {
  const state = useOnboarding();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    seed(state);
    setIsReady(true);
    // Semeia uma única vez, na montagem.
    // oxlint-disable-next-line react/exhaustive-deps
  }, []);

  return isReady ? <>{children}</> : null;
}

/** Monta a tela dentro de um `OnboardingProvider` já preenchido pelas etapas anteriores. */
export function withOnboarding(ui: ReactNode, seed: (state: OnboardingState) => void = () => {}) {
  return (
    <OnboardingProvider>
      <Seed seed={seed}>{ui}</Seed>
    </OnboardingProvider>
  );
}

export const TEST_USER: SessionUser = {
  id: 'user-1',
  email: 'ana@example.com',
  fullName: 'Ana Souza',
  role: 'USER',
  onboardingCompleted: false,
};

export function makeSession(
  overrides: Partial<{
    token: string | null;
    user: SessionUser | null;
    login: jest.Mock;
    logout: jest.Mock;
  }> = {},
) {
  const token = overrides.token === undefined ? 'token-123' : overrides.token;
  return {
    token,
    user: overrides.user === undefined ? TEST_USER : overrides.user,
    isAuthenticated: token !== null,
    isLoading: false,
    login: overrides.login ?? jest.fn().mockResolvedValue(undefined),
    logout: overrides.logout ?? jest.fn().mockResolvedValue(undefined),
  };
}
