import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppState, Pressable, Text, type AppStateStatus } from 'react-native';
import { setMockPathname, setMockSearchParams } from '@test/mocks/expoRouter';
import { AchievementAlertProvider, useAchievementAlerts } from './AchievementAlertContext';
import {
  acknowledgeAchievement,
  getPendingAchievements,
  type Achievement,
} from './achievementsService';

const mockSession: { token: string | null; user: { id: string } | null } = {
  token: 'tok',
  user: { id: 'u1' },
};

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));
jest.mock('./achievementsService', () => ({
  getPendingAchievements: jest.fn(),
  acknowledgeAchievement: jest.fn(),
}));
jest.mock('@/components/achievements/AchievementToast', () => {
  const { Pressable: MockPressable, Text: MockText } = require('react-native');
  return {
    AchievementToast: ({ name, onDismiss }: { name: string; onDismiss: () => void }) => (
      <MockPressable accessibilityRole="button" onPress={onDismiss}>
        <MockText>{`Toast: ${name}`}</MockText>
      </MockPressable>
    ),
  };
});

const getPendingMock = jest.mocked(getPendingAchievements);
const acknowledgeMock = jest.mocked(acknowledgeAchievement);

function achievement(id: string): Achievement {
  return {
    id,
    name: `Conquista ${id}`,
    description: '',
    icon: 'star',
    category: 'mood',
    unlocked: true,
    progress: { current: 1, target: 1 },
    unlockedAt: null,
  };
}

function CheckButton() {
  const { checkForNewAchievements } = useAchievementAlerts();
  return (
    <Pressable onPress={checkForNewAchievements}>
      <Text>Verificar</Text>
    </Pressable>
  );
}

async function renderProvider() {
  const view = await render(
    <AchievementAlertProvider>
      <CheckButton />
    </AchievementAlertProvider>,
  );
  return {
    ...view,
    rerenderProvider: () =>
      view.rerender(
        <AchievementAlertProvider>
          <CheckButton />
        </AchievementAlertProvider>,
      ),
  };
}

/** Deixa as promessas resolverem e passa o atraso de exibição do aviso. */
async function flushAndShow() {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
}

let appStateListener: ((state: AppStateStatus) => void) | null = null;
const removeAppStateListener = jest.fn();

describe('AchievementAlertProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockSession.token = 'tok';
    mockSession.user = { id: 'u1' };
    getPendingMock.mockResolvedValue([]);
    acknowledgeMock.mockResolvedValue(undefined);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      appStateListener = listener as (state: AppStateStatus) => void;
      return { remove: removeAppStateListener } as ReturnType<typeof AppState.addEventListener>;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('useAchievementAlerts exige o provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(render(<CheckButton />)).rejects.toThrow(
      'useAchievementAlerts precisa estar dentro de AchievementAlertProvider.',
    );
  });

  it('sem sessão, não procura conquistas', async () => {
    mockSession.token = null;
    mockSession.user = null;

    await renderProvider();
    await fireEvent.press(screen.getByText('Verificar'));

    expect(getPendingMock).not.toHaveBeenCalled();
  });

  it('ao entrar, mostra os pendentes um por vez, depois do atraso, e confirma cada um', async () => {
    getPendingMock.mockResolvedValue([achievement('1'), achievement('2')]);

    await renderProvider();
    expect(getPendingMock).toHaveBeenCalledWith('tok');

    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(399);
    });
    expect(screen.queryByText(/^Toast:/)).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByText('Toast: Conquista 1')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Toast: Conquista 1'));
    expect(acknowledgeMock).toHaveBeenCalledWith('tok', '1');
    expect(screen.getByText('Toast: Conquista 2')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Toast: Conquista 2'));
    expect(acknowledgeMock).toHaveBeenCalledWith('tok', '2');
    expect(screen.queryByText(/^Toast:/)).toBeNull();
  });

  it('não duplica avisos já na fila nem os já vistos, mesmo se o acknowledge falhar', async () => {
    getPendingMock.mockResolvedValue([achievement('1')]);
    acknowledgeMock.mockRejectedValue(new Error('rede'));
    await renderProvider();
    await flushAndShow();

    // Nova verificação com o mesmo item na fila: nada muda.
    await fireEvent.press(screen.getByText('Verificar'));
    await flushAndShow();
    expect(screen.getAllByText('Toast: Conquista 1')).toHaveLength(1);

    await fireEvent.press(screen.getByText('Toast: Conquista 1'));
    expect(screen.queryByText(/^Toast:/)).toBeNull();

    // O backend ainda devolve o item (acknowledge falhou), mas ele não volta nesta sessão.
    getPendingMock.mockResolvedValue([achievement('1'), achievement('3')]);
    await fireEvent.press(screen.getByText('Verificar'));
    await flushAndShow();
    expect(screen.queryByText('Toast: Conquista 1')).toBeNull();
    expect(screen.getByText('Toast: Conquista 3')).toBeOnTheScreen();
  });

  it('ignora falhas da API de pendentes', async () => {
    getPendingMock.mockRejectedValue(new Error('offline'));

    await renderProvider();
    await flushAndShow();

    expect(screen.queryByText(/^Toast:/)).toBeNull();
  });

  it.each([
    ['/apoio', undefined],
    ['/respiracao', 'apoio'],
  ])('espera sair do fluxo de apoio (%s, origem %s) para mostrar o aviso', async (path, origem) => {
    getPendingMock.mockResolvedValue([achievement('1')]);
    setMockPathname(path);
    setMockSearchParams({ origem });

    const { rerenderProvider } = await renderProvider();
    await flushAndShow();
    expect(screen.queryByText('Toast: Conquista 1')).toBeNull();

    setMockPathname('/');
    setMockSearchParams({});
    await rerenderProvider();
    expect(screen.getByText('Toast: Conquista 1')).toBeOnTheScreen();
  });

  it('mostra o aviso na respiração aberta fora do Apoio', async () => {
    getPendingMock.mockResolvedValue([achievement('1')]);
    setMockPathname('/respiracao');

    await renderProvider();
    await flushAndShow();

    expect(screen.getByText('Toast: Conquista 1')).toBeOnTheScreen();
  });

  it('ao voltar para o app, procura novos desbloqueios', async () => {
    const { unmount } = await renderProvider();
    expect(getPendingMock).toHaveBeenCalledTimes(1);

    await act(async () => appStateListener?.('background'));
    expect(getPendingMock).toHaveBeenCalledTimes(1);

    getPendingMock.mockResolvedValue([achievement('9')]);
    await act(async () => appStateListener?.('active'));
    expect(getPendingMock).toHaveBeenCalledTimes(2);
    await flushAndShow();
    expect(screen.getByText('Toast: Conquista 9')).toBeOnTheScreen();

    await unmount();
    expect(removeAppStateListener).toHaveBeenCalled();
  });

  it('descarta respostas que chegam depois de trocar de usuário', async () => {
    let resolvePending!: (items: Achievement[]) => void;
    getPendingMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePending = resolve;
      }),
    );
    const { rerenderProvider } = await renderProvider();

    mockSession.user = { id: 'u2' };
    await rerenderProvider();
    await act(async () => resolvePending([achievement('1')]));
    await flushAndShow();

    expect(screen.queryByText('Toast: Conquista 1')).toBeNull();
  });

  it('ao trocar de usuário, cancela o aviso agendado e esconde a fila anterior', async () => {
    getPendingMock.mockResolvedValueOnce([achievement('1')]);
    const { rerenderProvider } = await renderProvider();
    await act(async () => {
      await Promise.resolve();
    });

    mockSession.user = { id: 'u2' };
    await rerenderProvider();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Toast: Conquista 1')).toBeNull();
  });

  it('esconde a fila de outra conta e não confirma sem token', async () => {
    getPendingMock.mockResolvedValueOnce([achievement('1')]);
    const { rerenderProvider } = await renderProvider();
    await flushAndShow();
    expect(screen.getByText('Toast: Conquista 1')).toBeOnTheScreen();

    mockSession.user = { id: 'u2' };
    await rerenderProvider();
    expect(screen.queryByText('Toast: Conquista 1')).toBeNull();

    mockSession.token = null;
    mockSession.user = { id: 'u1' };
    await rerenderProvider();
    expect(screen.queryByText(/^Toast:/)).toBeNull();
    expect(acknowledgeMock).not.toHaveBeenCalled();
  });

  it('cancela avisos agendados ao desmontar', async () => {
    getPendingMock.mockResolvedValue([achievement('1')]);
    const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');
    const { unmount } = await renderProvider();
    await act(async () => {
      await Promise.resolve();
    });
    const showDelayCall = setTimeoutSpy.mock.results.find(
      (_result, index) => setTimeoutSpy.mock.calls[index][1] === 400,
    );
    expect(showDelayCall).toBeDefined();

    await unmount();

    const clearedTimers = clearTimeoutSpy.mock.calls.map(([timer]) => timer);
    expect(clearedTimers).toContain(showDelayCall?.value);
  });
});
