import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/services/apiClient';
import { listMeditations, type Meditation } from './meditationService';
import { useMeditations } from './useMeditations';

const mockLogout = jest.fn();
let mockSession: {
  token: string | null;
  user: { id: string } | null;
  logout: jest.Mock;
};

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));

jest.mock('./meditationService', () => ({ listMeditations: jest.fn() }));

const listMock = listMeditations as jest.MockedFunction<typeof listMeditations>;

const MEDITATION: Meditation = {
  id: 'm1',
  title: 'Calma',
  description: '',
  durationSeconds: 60,
  audioUrl: 'https://a/1.mp3',
};

beforeEach(() => {
  listMock.mockReset();
  mockLogout.mockReset().mockResolvedValue(undefined);
  mockSession = { token: 'tok', user: { id: 'u1' }, logout: mockLogout };
});

describe('useMeditations', () => {
  it('carrega as meditações do usuário', async () => {
    listMock.mockResolvedValueOnce([MEDITATION]);
    const { result } = await renderHook(() => useMeditations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.meditations).toEqual([MEDITATION]);
    expect(result.current.hasError).toBe(false);
    expect(listMock).toHaveBeenCalledWith('tok');
  });

  it('não busca nada sem sessão', async () => {
    mockSession = { token: null, user: null, logout: mockLogout };
    const { result } = await renderHook(() => useMeditations());

    expect(listMock).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ meditations: null, isLoading: false, hasError: false });
  });

  it('marca erro em falhas genéricas e o retry recarrega', async () => {
    listMock.mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce([MEDITATION]);
    const { result } = await renderHook(() => useMeditations());

    await waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current.meditations).toBeNull();

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.meditations).toEqual([MEDITATION]));
    expect(result.current.hasError).toBe(false);
  });

  it('faz logout quando a API responde 401', async () => {
    listMock.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));
    const { result } = await renderHook(() => useMeditations());

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });

  it('ignora resultados que chegam depois de sair do foco', async () => {
    let resolve: (value: Meditation[]) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    listMock
      .mockReturnValueOnce(
        new Promise((r) => {
          resolve = r;
        }),
      )
      .mockReturnValueOnce(
        new Promise((_r, rj) => {
          reject = rj;
        }),
      );

    const first = await renderHook(() => useMeditations());
    await first.unmount();
    await act(async () => {
      resolve([MEDITATION]);
    });

    const second = await renderHook(() => useMeditations());
    await second.unmount();
    await act(async () => {
      reject(new ApiError(401, 'x'));
    });

    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('descarta o resultado de outro usuário', async () => {
    listMock.mockResolvedValueOnce([MEDITATION]).mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = await renderHook(() => useMeditations());
    await waitFor(() => expect(result.current.meditations).toEqual([MEDITATION]));

    mockSession = { token: 'tok2', user: { id: 'u2' }, logout: mockLogout };
    await rerender({});

    expect(result.current.meditations).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });
});
