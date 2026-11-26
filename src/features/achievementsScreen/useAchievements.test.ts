import { act, renderHook, waitFor } from '@testing-library/react-native';
import { getAchievements, type Achievement } from '@/features/achievements/achievementsService';
import { ApiError } from '@/services/apiClient';
import { useAchievements } from './useAchievements';

const mockSession: {
  token: string | null;
  user: { id: string } | null;
  logout: jest.Mock;
} = { token: 'tok', user: { id: 'u1' }, logout: jest.fn() };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));
jest.mock('@/features/achievements/achievementsService', () => ({ getAchievements: jest.fn() }));

const getAchievementsMock = jest.mocked(getAchievements);

function achievement(id: string): Achievement {
  return {
    id,
    name: id,
    description: '',
    icon: 'star',
    category: 'mood',
    unlocked: false,
    progress: { current: 0, target: 1 },
    unlockedAt: null,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useAchievements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.token = 'tok';
    mockSession.user = { id: 'u1' };
    mockSession.logout = jest.fn().mockResolvedValue(undefined);
  });

  it('sem sessão, não busca e não fica carregando', async () => {
    mockSession.token = null;
    mockSession.user = null;

    const { result } = await renderHook(() => useAchievements());

    expect(getAchievementsMock).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ achievements: null, isLoading: false, hasError: false });
  });

  it('carrega as conquistas ao entrar em foco', async () => {
    getAchievementsMock.mockResolvedValue([achievement('a')]);

    const { result } = await renderHook(() => useAchievements());

    await waitFor(() => expect(result.current.achievements).toEqual([achievement('a')]));
    expect(getAchievementsMock).toHaveBeenCalledWith('tok');
    expect(result.current).toMatchObject({ isLoading: false, hasError: false });
  });

  it('em erro, sinaliza hasError; retry volta ao carregamento e busca de novo', async () => {
    getAchievementsMock.mockRejectedValueOnce(new Error('rede'));
    const { result } = await renderHook(() => useAchievements());
    await waitFor(() => expect(result.current.hasError).toBe(true));

    const next = deferred<Achievement[]>();
    getAchievementsMock.mockReturnValueOnce(next.promise);
    await act(async () => result.current.retry());
    expect(result.current).toMatchObject({ isLoading: true, hasError: false });

    await act(async () => next.resolve([]));
    expect(result.current.achievements).toEqual([]);
  });

  it('em 401, encerra a sessão', async () => {
    getAchievementsMock.mockRejectedValue(new ApiError(401, 'x'));

    const { result } = await renderHook(() => useAchievements());

    await waitFor(() => expect(mockSession.logout).toHaveBeenCalledTimes(1));
    expect(result.current.hasError).toBe(false);
  });

  it('ignora respostas que chegam depois de sair de foco', async () => {
    const success = deferred<Achievement[]>();
    getAchievementsMock.mockReturnValueOnce(success.promise);
    const first = await renderHook(() => useAchievements());
    await first.unmount();
    await act(async () => success.resolve([achievement('a')]));

    const failure = deferred<Achievement[]>();
    getAchievementsMock.mockReturnValueOnce(failure.promise);
    const second = await renderHook(() => useAchievements());
    await second.unmount();
    await act(async () => failure.reject(new ApiError(401, 'x')));

    expect(mockSession.logout).not.toHaveBeenCalled();
  });

  it('ao trocar de usuário, descarta a lista anterior', async () => {
    getAchievementsMock.mockResolvedValueOnce([achievement('a')]);
    const { result, rerender } = await renderHook(() => useAchievements());
    await waitFor(() => expect(result.current.achievements).toHaveLength(1));

    getAchievementsMock.mockReturnValueOnce(new Promise(() => undefined));
    mockSession.user = { id: 'u2' };
    await rerender({});

    expect(result.current).toMatchObject({ achievements: null, isLoading: true });
  });
});
