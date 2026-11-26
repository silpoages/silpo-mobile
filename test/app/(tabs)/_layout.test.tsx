import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeSessionUser, makeSessionValue } from '@test/auth-helpers';
import { setMockPathname } from '@test/mocks/expoRouter';
import type { ReactElement, ReactNode } from 'react';

import TabsLayout from '../../../app/(tabs)/_layout';
import { useSession } from '@/features/auth/session/SessionContext';

type TabBarRenderer = (props: unknown) => ReactElement | null;

const mockTabs: { tabBar?: TabBarRenderer; screens: string[] } = { screens: [] };

jest.mock('expo-router/js-tabs', () => {
  function Tabs({ children, tabBar }: { children: ReactNode; tabBar: TabBarRenderer }) {
    mockTabs.tabBar = tabBar;
    return children;
  }
  Tabs.Screen = ({ name }: { name: string }) => {
    mockTabs.screens.push(name);
    return null;
  };
  return { Tabs };
});
jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));

const mockedUseSession = jest.mocked(useSession);

function navigationProps(routeName: string | undefined, navigate = jest.fn()) {
  return {
    state: { index: 0, routes: routeName ? [{ name: routeName }] : [] },
    navigation: { navigate },
  };
}

describe('TabsLayout', () => {
  beforeEach(() => {
    mockTabs.tabBar = undefined;
    mockTabs.screens = [];
  });

  it('manda quem não tem sessão para a Welcome', async () => {
    mockedUseSession.mockReturnValue(makeSessionValue());
    setMockPathname('/diario');

    await render(<TabsLayout />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/welcome');
  });

  it('esconde a barra para visitante nas rotas públicas', async () => {
    mockedUseSession.mockReturnValue(makeSessionValue());
    setMockPathname('/apoio');

    await render(<TabsLayout />);

    expect(screen.queryByTestId('redirect')).toBeNull();
    expect(mockTabs.screens).toEqual(['index', 'diario', 'jornada', 'apoio', 'perfil']);
    expect(mockTabs.tabBar?.(navigationProps('apoio'))).toBeNull();
  });

  describe('com sessão', () => {
    beforeEach(async () => {
      mockedUseSession.mockReturnValue(
        makeSessionValue({
          isAuthenticated: true,
          user: makeSessionUser({ onboardingCompleted: true }),
        }),
      );
      setMockPathname('/');
      await render(<TabsLayout />);
    });

    it('mostra a barra de abas e navega pela aba tocada', async () => {
      const navigate = jest.fn();
      await render(mockTabs.tabBar?.(navigationProps('jornada', navigate)) as ReactElement);

      expect(screen.getByText('Jornada')).toBeOnTheScreen();

      await fireEvent.press(screen.getByText('Home'));
      expect(navigate).toHaveBeenCalledWith('index');

      await fireEvent.press(screen.getByText('Apoio'));
      expect(navigate).toHaveBeenCalledWith('apoio');
    });

    it.each([undefined, 'perfil'])('marca Home quando a rota ativa é %s', async (routeName) => {
      const element = mockTabs.tabBar?.(navigationProps(routeName)) as ReactElement<{
        activeTab: string;
      }>;

      expect(element.props.activeTab).toBe('home');
    });
  });

  it('manda quem não fez o onboarding para a etapa 1', async () => {
    mockedUseSession.mockReturnValue(
      makeSessionValue({ isAuthenticated: true, user: makeSessionUser() }),
    );
    setMockPathname('/');

    await render(<TabsLayout />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/onboarding/etapa-1');
  });

  it('trata sessão sem usuário como onboarding pendente', async () => {
    mockedUseSession.mockReturnValue(makeSessionValue({ isAuthenticated: true }));
    setMockPathname('/');

    await render(<TabsLayout />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/onboarding/etapa-1');
  });
});
