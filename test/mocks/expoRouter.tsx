/**
 * Mock compartilhado do `expo-router` (registrado em `test/setup.tsx`).
 * Os testes importam `mockRouter`/helpers daqui para inspecionar a navegação.
 */
import { useEffect, type ReactNode } from 'react';
import { Text } from 'react-native';

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
  back: jest.fn(),
  dismissTo: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};

const state: {
  pathname: string;
  localParams: Record<string, string | string[] | undefined>;
  globalParams: Record<string, string | string[] | undefined>;
  rootNavigationState: { key?: string } | undefined;
} = {
  pathname: '/',
  localParams: {},
  globalParams: {},
  rootNavigationState: { key: 'root' },
};

export function setMockPathname(pathname: string) {
  state.pathname = pathname;
}

export function setMockSearchParams(params: Record<string, string | string[] | undefined>) {
  state.localParams = params;
  state.globalParams = params;
}

export function setMockRootNavigationState(value: { key?: string } | undefined) {
  state.rootNavigationState = value;
}

export function resetExpoRouterMock() {
  Object.values(mockRouter).forEach((fn) => fn.mockClear());
  mockRouter.canGoBack.mockImplementation(() => true);
  state.pathname = '/';
  state.localParams = {};
  state.globalParams = {};
  state.rootNavigationState = { key: 'root' };
}

export const router = mockRouter;
export const useRouter = () => mockRouter;
export const usePathname = () => state.pathname;
export const useLocalSearchParams = () => state.localParams;
export const useGlobalSearchParams = () => state.globalParams;
export const useRootNavigationState = () => state.rootNavigationState;
export const useNavigation = () => ({ navigate: jest.fn(), goBack: jest.fn() });

/** Roda o callback como um efeito de montagem (a tela de teste está sempre "em foco"). */
export function useFocusEffect(effect: () => void | (() => void)) {
  useEffect(() => effect(), [effect]);
}

/** Renderiza o destino como texto para os testes poderem conferir o redirecionamento. */
export function Redirect({ href }: { href: unknown }) {
  return <Text testID="redirect">{typeof href === 'string' ? href : JSON.stringify(href)}</Text>;
}

export function Link({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

function MockScreen(_props: Record<string, unknown>) {
  return null;
}

export function Stack(_props: Record<string, unknown>) {
  return <Text testID="stack" />;
}
Stack.Screen = MockScreen;

export function Tabs({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
Tabs.Screen = MockScreen;
