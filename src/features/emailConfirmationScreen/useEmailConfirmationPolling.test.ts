import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { signIn, type SignInResult } from '@/features/auth/services/authService';
import { useEmailConfirmationPolling } from '@/features/emailConfirmationScreen/useEmailConfirmationPolling';

jest.mock('@/features/auth/services/authService', () => ({
  signIn: jest.fn(),
}));

const mockedSignIn = jest.mocked(signIn);
const credentials = { email: 'ana@silpo.com', password: 'segredo123' };

function result(isEmailConfirmed: boolean): SignInResult {
  return {
    token: 'tok',
    user: {
      id: 'u1',
      email: credentials.email,
      fullName: null,
      role: 'USER',
      onboardingCompleted: false,
    },
    isEmailConfirmed,
  };
}

let appStateListener: ((state: AppStateStatus) => void) | undefined;
const removeSubscription = jest.fn();

describe('useEmailConfirmationPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedSignIn.mockReset();
    removeSubscription.mockClear();
    appStateListener = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      appStateListener = listener as (state: AppStateStatus) => void;
      return { remove: removeSubscription } as unknown as ReturnType<
        typeof AppState.addEventListener
      >;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('não consulta nada sem credenciais', async () => {
    const { result: hook } = await renderHook(() => useEmailConfirmationPolling(null));

    expect(hook.current).toBeNull();
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it('consulta logo ao montar e devolve o resultado quando confirmado', async () => {
    mockedSignIn.mockResolvedValue(result(true));

    const { result: hook } = await renderHook(() => useEmailConfirmationPolling(credentials));
    await act(async () => {});

    expect(mockedSignIn).toHaveBeenCalledWith(credentials);
    expect(hook.current?.token).toBe('tok');
    // confirmado: o efeito para de consultar e remove a inscrição do AppState
    expect(removeSubscription).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(mockedSignIn).toHaveBeenCalledTimes(1);
  });

  it('tenta de novo a cada 5 s enquanto não confirma, ignorando erros', async () => {
    mockedSignIn
      .mockRejectedValueOnce(new Error('403'))
      .mockResolvedValueOnce(result(false))
      .mockResolvedValueOnce(result(true));

    const { result: hook } = await renderHook(() => useEmailConfirmationPolling(credentials));
    await act(async () => {});
    expect(hook.current).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockedSignIn).toHaveBeenCalledTimes(2);
    expect(hook.current).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockedSignIn).toHaveBeenCalledTimes(3);
    expect(hook.current?.isEmailConfirmed).toBe(true);
  });

  it('consulta ao voltar para o app, sem sobrepor consultas em andamento', async () => {
    let resolvePending: (value: SignInResult) => void = () => {};
    mockedSignIn.mockResolvedValueOnce(result(false)).mockImplementationOnce(
      () =>
        new Promise<SignInResult>((resolve) => {
          resolvePending = resolve;
        }),
    );

    await renderHook(() => useEmailConfirmationPolling(credentials));
    await act(async () => {});
    expect(mockedSignIn).toHaveBeenCalledTimes(1);

    await act(async () => {
      appStateListener?.('background');
    });
    expect(mockedSignIn).toHaveBeenCalledTimes(1);

    await act(async () => {
      appStateListener?.('active');
    });
    expect(mockedSignIn).toHaveBeenCalledTimes(2);

    // ainda consultando: o intervalo não dispara outra chamada
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockedSignIn).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolvePending(result(false));
    });
  });

  it('ignora resposta que chega depois de desmontar', async () => {
    let resolvePending: (value: SignInResult) => void = () => {};
    mockedSignIn.mockImplementationOnce(
      () =>
        new Promise<SignInResult>((resolve) => {
          resolvePending = resolve;
        }),
    );

    const { result: hook, unmount } = await renderHook(() =>
      useEmailConfirmationPolling(credentials),
    );
    await unmount();

    await act(async () => {
      resolvePending(result(true));
    });
    expect(hook.current).toBeNull();
    expect(removeSubscription).toHaveBeenCalled();
  });
});
