import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ApiError } from '@/services/apiClient';
import { getJourney, type JourneyData } from './journeyService';
import { useJourney } from './useJourney';

const mockSession: {
  token: string | null;
  user: { id: string } | null;
  logout: jest.Mock;
} = { token: 'tok', user: { id: 'u1' }, logout: jest.fn() };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));
jest.mock('./journeyService', () => ({ getJourney: jest.fn() }));

const getJourneyMock = jest.mocked(getJourney);

function journey(daysRegistered: number): JourneyData {
  return {
    daysRegistered,
    practicesTried: 0,
    exercisesCompleted: 0,
    moodCounts: {},
    achievements: { unlocked: 0, total: 1 },
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

describe('useJourney', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.token = 'tok';
    mockSession.user = { id: 'u1' };
    mockSession.logout = jest.fn().mockResolvedValue(undefined);
  });

  it('sem sessão, não busca nada e não fica carregando', async () => {
    mockSession.token = null;
    mockSession.user = null;

    const { result } = await renderHook(() => useJourney());

    expect(getJourneyMock).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ journey: null, isLoading: false, hasError: false });
  });

  it('com token mas sem usuário, não busca e continua carregando', async () => {
    mockSession.user = null;

    const { result } = await renderHook(() => useJourney());

    expect(getJourneyMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);
  });

  it('carrega o resumo ao entrar em foco', async () => {
    getJourneyMock.mockResolvedValue(journey(3));

    const { result } = await renderHook(() => useJourney());

    await waitFor(() => expect(result.current.journey).toEqual(journey(3)));
    expect(getJourneyMock).toHaveBeenCalledWith('tok');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it('em erro, sinaliza hasError e o retry volta ao carregamento até buscar de novo', async () => {
    getJourneyMock.mockRejectedValueOnce(new Error('rede'));
    const { result } = await renderHook(() => useJourney());
    await waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current.isLoading).toBe(false);

    const next = deferred<JourneyData>();
    getJourneyMock.mockReturnValueOnce(next.promise);
    await act(async () => result.current.retry());
    expect(result.current).toMatchObject({ isLoading: true, hasError: false });

    await act(async () => next.resolve(journey(1)));
    expect(result.current.journey).toEqual(journey(1));
  });

  it('refresh mantém o último resumo enquanto busca', async () => {
    getJourneyMock.mockResolvedValueOnce(journey(1));
    const { result } = await renderHook(() => useJourney());
    await waitFor(() => expect(result.current.journey).toEqual(journey(1)));

    const next = deferred<JourneyData>();
    getJourneyMock.mockReturnValueOnce(next.promise);
    await act(async () => result.current.refresh());
    expect(result.current).toMatchObject({ journey: journey(1), isLoading: false });

    await act(async () => next.resolve(journey(2)));
    expect(result.current.journey).toEqual(journey(2));
  });

  it('em 401, encerra a sessão em vez de mostrar erro', async () => {
    getJourneyMock.mockRejectedValue(new ApiError(401, 'Não autorizado'));

    const { result } = await renderHook(() => useJourney());

    await waitFor(() => expect(mockSession.logout).toHaveBeenCalledTimes(1));
    expect(result.current.hasError).toBe(false);
  });

  it('ignora respostas que chegam depois de sair de foco', async () => {
    const success = deferred<JourneyData>();
    getJourneyMock.mockReturnValueOnce(success.promise);
    const first = await renderHook(() => useJourney());
    await first.unmount();
    await act(async () => success.resolve(journey(5)));

    const failure = deferred<JourneyData>();
    getJourneyMock.mockReturnValueOnce(failure.promise);
    const second = await renderHook(() => useJourney());
    await second.unmount();
    await act(async () => failure.reject(new ApiError(401, 'x')));

    expect(mockSession.logout).not.toHaveBeenCalled();
  });

  it('ao trocar de usuário, descarta o resumo anterior e volta ao carregamento', async () => {
    getJourneyMock.mockResolvedValueOnce(journey(4));
    const { result, rerender } = await renderHook(() => useJourney());
    await waitFor(() => expect(result.current.journey).toEqual(journey(4)));

    const next = deferred<JourneyData>();
    getJourneyMock.mockReturnValueOnce(next.promise);
    mockSession.user = { id: 'u2' };
    await rerender({});

    expect(result.current).toMatchObject({ journey: null, isLoading: true });
    await act(async () => next.resolve(journey(0)));
    expect(result.current.journey).toEqual(journey(0));
  });
});
