import { render, screen } from '@testing-library/react-native';
import { setMockPathname, setMockRootNavigationState } from '@test/mocks/expoRouter';

import { RouteGuard } from '@/features/auth/session/RouteGuard';
import { useSession } from '@/features/auth/session/SessionContext';

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: jest.fn(),
}));

const mockedUseSession = jest.mocked(useSession);

function mockSession(isAuthenticated: boolean, onboardingCompleted?: boolean) {
  mockedUseSession.mockReturnValue({
    token: isAuthenticated ? 'tok' : null,
    user:
      onboardingCompleted === undefined
        ? null
        : { id: 'u1', email: 'a@b.com', fullName: null, role: 'USER', onboardingCompleted },
    isAuthenticated,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

describe('RouteGuard', () => {
  it('não faz nada enquanto a navegação raiz não está pronta', async () => {
    mockSession(false);
    setMockPathname('/');
    setMockRootNavigationState(undefined);

    await render(<RouteGuard />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('manda quem não tem sessão para a Welcome', async () => {
    mockSession(false);
    setMockPathname('/diario');

    await render(<RouteGuard />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/welcome');
  });

  it('manda quem tem sessão sem onboarding para a etapa 1', async () => {
    mockSession(true);
    setMockPathname('/');

    await render(<RouteGuard />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/onboarding/etapa-1');
  });

  it('deixa ficar quando a rota é permitida', async () => {
    mockSession(true, true);
    setMockPathname('/diario');

    await render(<RouteGuard />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});
