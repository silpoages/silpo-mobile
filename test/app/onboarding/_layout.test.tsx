import { render, screen } from '@testing-library/react-native';
import { makeSessionUser, makeSessionValue } from '@test/auth-helpers';
import type { ReactNode } from 'react';

import OnboardingLayout from '../../../app/onboarding/_layout';
import { useSession } from '@/features/auth/session/SessionContext';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/features/onboarding/OnboardingContext', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    OnboardingProvider: ({ children }: { children: ReactNode }) => (
      <View testID="onboarding-provider">{children}</View>
    ),
  };
});

const mockedUseSession = jest.mocked(useSession);

describe('OnboardingLayout', () => {
  it('monta as etapas dentro do OnboardingProvider', async () => {
    mockedUseSession.mockReturnValue(
      makeSessionValue({ isAuthenticated: true, user: makeSessionUser() }),
    );

    await render(<OnboardingLayout />);

    expect(screen.getByTestId('onboarding-provider')).toBeOnTheScreen();
    expect(screen.getByTestId('stack')).toBeOnTheScreen();
    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('trata sessão sem usuário como onboarding pendente', async () => {
    mockedUseSession.mockReturnValue(makeSessionValue({ isAuthenticated: true }));

    await render(<OnboardingLayout />);

    expect(screen.getByTestId('stack')).toBeOnTheScreen();
  });

  it('manda para a Home quem já concluiu o onboarding', async () => {
    mockedUseSession.mockReturnValue(
      makeSessionValue({
        isAuthenticated: true,
        user: makeSessionUser({ onboardingCompleted: true }),
      }),
    );

    await render(<OnboardingLayout />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/');
  });
});
