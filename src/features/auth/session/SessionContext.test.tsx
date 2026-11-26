import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  SessionProvider,
  useSession,
  type SessionUser,
} from '@/features/auth/session/SessionContext';
import { cancelDailyReminder } from '@/features/notifications/dailyReminder';

jest.mock('@/features/notifications/dailyReminder', () => ({
  cancelDailyReminder: jest.fn().mockResolvedValue(undefined),
}));

const user: SessionUser = {
  id: 'u1',
  email: 'ana@silpo.com',
  fullName: 'Ana',
  role: 'USER',
  onboardingCompleted: true,
};

function wrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

async function renderSession() {
  const hook = await renderHook(() => useSession(), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('SessionProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.mocked(cancelDailyReminder).mockClear();
  });

  it('começa sem sessão quando o storage está vazio', async () => {
    const { result } = await renderSession();

    expect(result.current).toMatchObject({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('restaura a sessão persistida', async () => {
    await AsyncStorage.setItem('silpo.session.token', 'tok');
    await AsyncStorage.setItem('silpo.session.user', JSON.stringify(user));

    const { result } = await renderSession();

    expect(result.current.token).toBe('tok');
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('ignora sessão incompleta no storage', async () => {
    await AsyncStorage.setItem('silpo.session.token', 'tok');

    const { result } = await renderSession();

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login persiste e expõe a sessão', async () => {
    const { result } = await renderSession();

    await act(async () => {
      await result.current.login('novo-token', user);
    });

    expect(result.current.token).toBe('novo-token');
    expect(result.current.user).toEqual(user);
    expect(await AsyncStorage.getItem('silpo.session.token')).toBe('novo-token');
    expect(JSON.parse((await AsyncStorage.getItem('silpo.session.user')) ?? 'null')).toEqual(user);
  });

  it('logout limpa a sessão, o storage e cancela o lembrete', async () => {
    const { result } = await renderSession();
    await act(async () => {
      await result.current.login('tok', user);
    });
    const logoutBefore = result.current.logout;

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(await AsyncStorage.getItem('silpo.session.token')).toBeNull();
    expect(await AsyncStorage.getItem('silpo.session.user')).toBeNull();
    expect(cancelDailyReminder).toHaveBeenCalledTimes(1);
    // logout é estável entre renders (usado como dependência de efeitos)
    expect(result.current.logout).toBe(logoutBefore);
  });
});

describe('useSession', () => {
  it('falha fora do SessionProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(renderHook(() => useSession())).rejects.toThrow(
      'useSession precisa ser usado dentro de um SessionProvider',
    );

    jest.mocked(console.error).mockRestore();
  });
});
