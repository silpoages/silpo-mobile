import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter, setMockSearchParams } from '@test/mocks/expoRouter';
import { setAudioModeAsync } from 'expo-audio';
import { PanResponder, type PanResponderCallbacks } from 'react-native';

import MeditationPlayerRoute from '../../../app/meditation-player';
import { ApiError } from '@/services/apiClient';
import { registerMeditationSession } from './meditationService';
import { MeditationPlayerScreen } from './MeditationPlayerScreen';

// O primeiro render da tela (com transformação + cobertura) pode passar de 5s em máquinas carregadas.
jest.setTimeout(20000);

type FakeStatus = {
  playing: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  error?: string;
};

type StatusEvent = {
  didJustFinish?: boolean;
  duration?: number;
  currentTime?: number;
  isLoaded?: boolean;
};

const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
  replace: jest.fn(),
};
let mockStatus: FakeStatus;
let mockStatusListener: ((status: StatusEvent) => void) | null = null;
const mockLogout = jest.fn();
const mockCheckForNewAchievements = jest.fn();
let mockToken: string | null = 'tok';

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => mockStatus,
  setAudioModeAsync: jest.fn(),
}));

jest.mock('expo', () => ({
  useEventListener: (
    _emitter: unknown,
    _event: string,
    listener: (status: StatusEvent) => void,
  ) => {
    mockStatusListener = listener;
  },
}));

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => ({ token: mockToken, logout: mockLogout }),
}));

jest.mock('@/features/achievements/AchievementAlertContext', () => ({
  useAchievementAlerts: () => ({ checkForNewAchievements: mockCheckForNewAchievements }),
}));

jest.mock('./meditationService', () => ({ registerMeditationSession: jest.fn() }));

jest.mock('@expo/vector-icons/Feather', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
  };
});

const setAudioModeMock = setAudioModeAsync as jest.Mock;
const registerMock = registerMeditationSession as jest.MockedFunction<
  typeof registerMeditationSession
>;

function emitStatus(event: StatusEvent) {
  return act(async () => {
    mockStatusListener?.(event);
  });
}

async function updateStatus(
  patch: Partial<FakeStatus>,
  rerender: (element: React.ReactElement) => Promise<void>,
) {
  mockStatus = { ...mockStatus, ...patch };
  await rerender(<MeditationPlayerScreen />);
}

async function flushAnimations() {
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  Object.values(mockPlayer).forEach((fn) => fn.mockReset());
  setAudioModeMock.mockReset().mockResolvedValue(undefined);
  registerMock.mockReset().mockResolvedValue(undefined);
  mockLogout.mockReset().mockResolvedValue(undefined);
  mockCheckForNewAchievements.mockReset();
  mockStatusListener = null;
  mockToken = 'tok';
  mockStatus = { playing: false, currentTime: 0, duration: 0, isLoaded: false };
});

afterEach(() => {
  jest.useRealTimers();
});

describe('MeditationPlayerScreen — sem áudio (prévia)', () => {
  it('usa título e duração padrão', async () => {
    setMockSearchParams({});
    await render(<MeditationPlayerRoute />);

    expect(screen.getByText('Meditação guiada')).toBeTruthy();
    expect(screen.getByText('Pausado')).toBeTruthy();
    expect(screen.getByText('0:00')).toBeTruthy();
    expect(screen.getByText('10:00')).toBeTruthy();
  });

  it('conta o tempo, pausa, retoma e finaliza ao atingir o limite', async () => {
    setMockSearchParams({ title: ['Respiro', 'ignorado'], max_time_seconds: '3.7' });
    await render(<MeditationPlayerScreen />);

    expect(screen.getByText('Respiro')).toBeTruthy();
    expect(screen.getByText('0:03')).toBeTruthy();

    await fireEvent.press(screen.getByText('icon:play'));
    expect(screen.getByText('Meditação Guiada')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('0:01')).toBeTruthy();

    await fireEvent.press(screen.getByText('icon:pause'));
    expect(screen.getByText('Pausado')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('0:01')).toBeTruthy();

    await fireEvent.press(screen.getByText('icon:play'));
    for (let i = 0; i < 2; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByText('SE QUISER, UM PRÓXIMO PASSO')).toBeTruthy();
    expect(screen.getByText('MEDITAÇÃO GUIADA · 1 MIN')).toBeTruthy();
    // A prévia não tem áudio concluído para registrar.
    expect(registerMock).not.toHaveBeenCalled();
    expect(setAudioModeMock).not.toHaveBeenCalled();
  });
});

describe('MeditationPlayerScreen — com áudio', () => {
  beforeEach(() => {
    setMockSearchParams({
      meditation_id: 'm1',
      title: 'Calma',
      audio_url: 'https://a/1.mp3',
    });
  });

  it('mostra carregando e desabilita o play até o áudio carregar', async () => {
    const { rerender } = await render(<MeditationPlayerScreen />);

    expect(screen.getByText('Carregando…')).toBeTruthy();
    await fireEvent.press(screen.getByText('icon:play'));
    expect(mockPlayer.play).not.toHaveBeenCalled();

    await updateStatus({ isLoaded: true, duration: 300.4 }, rerender);
    expect(screen.getByText('Pausado')).toBeTruthy();
    expect(screen.getByText('5:00')).toBeTruthy();
  });

  it('toca, mostra o progresso e pausa', async () => {
    mockStatus = { playing: false, currentTime: 0, duration: 120, isLoaded: true };
    const { rerender } = await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByText('icon:play'));
    expect(setAudioModeMock).toHaveBeenCalledWith({ playsInSilentMode: true });
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    expect(mockPlayer.seekTo).not.toHaveBeenCalled();

    await updateStatus({ playing: true, currentTime: 65.8 }, rerender);
    expect(screen.getByText('Meditação Guiada')).toBeTruthy();
    expect(screen.getByText('1:05')).toBeTruthy();

    await fireEvent.press(screen.getByText('icon:pause'));
    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  });

  it('recomeça do início quando o áudio já chegou ao fim', async () => {
    setMockSearchParams({ audio_url: 'https://a/1.mp3', max_time_seconds: '60' });
    mockStatus = { playing: false, currentTime: 90, duration: 120, isLoaded: true };
    await render(<MeditationPlayerScreen />);

    expect(screen.getAllByText('1:00')).toHaveLength(2);
    await fireEvent.press(screen.getByText('icon:play'));
    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(mockPlayer.play).toHaveBeenCalled();
  });

  it('mostra erro de reprodução e tenta tocar de novo', async () => {
    mockStatus = { playing: false, currentTime: 0, duration: 120, isLoaded: true };
    setAudioModeMock.mockRejectedValueOnce(new Error('audio'));
    await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByText('icon:play'));
    expect(screen.getByText('Não foi possível reproduzir o áudio.')).toBeTruthy();
    expect(mockPlayer.play).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.queryByText('Não foi possível reproduzir o áudio.')).toBeNull();
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('recarrega o áudio após erro de carregamento e retoma de onde parou', async () => {
    mockStatus = {
      playing: false,
      currentTime: 42,
      duration: 120,
      isLoaded: false,
      error: 'network',
    };
    await render(<MeditationPlayerScreen />);

    expect(screen.getByText('Não foi possível reproduzir o áudio.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(mockPlayer.replace).toHaveBeenCalledWith('https://a/1.mp3');

    // Eventos antes de carregar não retomam.
    await emitStatus({ isLoaded: false });
    expect(mockPlayer.seekTo).not.toHaveBeenCalled();

    mockPlayer.seekTo.mockResolvedValueOnce(undefined);
    await emitStatus({ isLoaded: true });
    expect(mockPlayer.seekTo).toHaveBeenCalledWith(42);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);

    // A retomada pendente é consumida uma única vez.
    await emitStatus({ isLoaded: true });
    expect(mockPlayer.seekTo).toHaveBeenCalledTimes(1);
  });

  it('marca falha quando a retomada não consegue posicionar o áudio', async () => {
    mockStatus = {
      playing: false,
      currentTime: 10,
      duration: 120,
      isLoaded: false,
      error: 'network',
    };
    const { rerender } = await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await updateStatus({ isLoaded: true, error: undefined }, rerender);
    mockPlayer.seekTo.mockRejectedValueOnce(new Error('seek'));
    await emitStatus({ isLoaded: true });

    expect(screen.getByText('Não foi possível reproduzir o áudio.')).toBeTruthy();
  });

  it('registra a meditação quando o áudio termina', async () => {
    mockStatus = { playing: true, currentTime: 100, duration: 120, isLoaded: true };
    let resolveRegister: () => void = () => {};
    registerMock.mockReturnValueOnce(
      new Promise((r) => {
        resolveRegister = () => r(undefined);
      }),
    );
    await render(<MeditationPlayerScreen />);

    await emitStatus({ didJustFinish: true, duration: 119.6, currentTime: 119.6 });

    expect(registerMock).toHaveBeenCalledWith('tok', 'm1', 120);
    expect(screen.getByText('Registrando sua meditação...')).toBeTruthy();
    expect(
      screen.getByText(
        'Meditação finalizada. Reserve um momento para perceber como você está se sentindo.',
      ),
    ).toBeTruthy();

    await act(async () => {
      resolveRegister();
    });
    expect(screen.queryByText('Registrando sua meditação...')).toBeNull();
    expect(mockCheckForNewAchievements).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Fazer outra meditação' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/meditations');
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para o início' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
  });

  it('usa o tempo atual (mínimo 1s) quando a duração não vem no evento', async () => {
    setMockSearchParams({
      meditation_id: 'm1',
      audio_url: 'https://a/1.mp3',
      max_time_seconds: '30',
    });
    mockStatus = { playing: true, currentTime: 0, duration: 0, isLoaded: true };
    await render(<MeditationPlayerScreen />);

    await emitStatus({ didJustFinish: true, duration: 0, currentTime: 0.2 });
    expect(registerMock).toHaveBeenCalledWith('tok', 'm1', 1);
  });

  it('permite tentar registrar de novo após falha', async () => {
    mockStatus = { playing: true, currentTime: 0, duration: 60, isLoaded: true };
    registerMock.mockRejectedValueOnce(new Error('rede'));
    await render(<MeditationPlayerScreen />);

    await emitStatus({ didJustFinish: true, duration: 60, currentTime: 60 });
    expect(screen.getByText('Não foi possível registrar a meditação.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar registrar de novo' }));
    expect(registerMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Não foi possível registrar a meditação.')).toBeNull();
  });

  it('faz logout se o registro responder 401', async () => {
    mockStatus = { playing: true, currentTime: 0, duration: 60, isLoaded: true };
    registerMock.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));
    await render(<MeditationPlayerScreen />);

    await emitStatus({ didJustFinish: true, duration: 60, currentTime: 60 });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Não foi possível registrar a meditação.')).toBeNull();
    expect(screen.queryByText('Registrando sua meditação...')).toBeNull();
  });

  it('não registra sem sessão', async () => {
    mockToken = null;
    mockStatus = { playing: true, currentTime: 0, duration: 60, isLoaded: true };
    await render(<MeditationPlayerScreen />);

    await emitStatus({ didJustFinish: true, duration: 60, currentTime: 60 });
    expect(registerMock).not.toHaveBeenCalled();
    expect(screen.getByText('SE QUISER, UM PRÓXIMO PASSO')).toBeTruthy();
  });
});

describe('MeditationPlayerScreen — encerrar', () => {
  beforeEach(() => {
    setMockSearchParams({ meditation_id: 'm1', title: 'Calma', audio_url: 'https://a/1.mp3' });
    mockStatus = { playing: true, currentTime: 10, duration: 60, isLoaded: true };
  });

  it('abre a folha de encerrar e continua a meditação', async () => {
    await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByText('Encerrar'));
    expect(mockPlayer.pause).toHaveBeenCalled();
    expect(screen.getByText('Encerrar meditação?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar meditação' }));
    await flushAnimations();
    expect(screen.queryByText('Encerrar meditação?')).toBeNull();
  });

  it('fecha a folha pelo botão voltar do sistema', async () => {
    await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByText('Encerrar'));
    const [modal] = screen.container.queryAll((node) => node.props.onRequestClose != null);
    await fireEvent(modal, 'requestClose');
    await flushAnimations();

    expect(screen.queryByText('Encerrar meditação?')).toBeNull();
  });

  it('fecha a folha ao tocar fora dela', async () => {
    await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByText('Encerrar'));
    const [modal] = screen.container.queryAll((node) => node.props.onRequestClose != null);
    // O fundo escurecido é o único elemento tocável sem conteúdo dentro do modal.
    const [backdrop] = modal.queryAll(
      (node) => node.children.length === 0 && typeof node.props.onResponderRelease === 'function',
    );
    await fireEvent.press(backdrop);
    await flushAnimations();

    expect(screen.queryByText('Encerrar meditação?')).toBeNull();
  });

  it('encerrar a meditação mostra a tela final sem registrar', async () => {
    await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByText('Encerrar'));
    await fireEvent.press(screen.getByRole('button', { name: 'Encerrar Meditação' }));
    await flushAnimations();

    expect(screen.getByText('SE QUISER, UM PRÓXIMO PASSO')).toBeTruthy();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('abre a folha ao tocar ou arrastar a alça para cima', async () => {
    const createSpy = jest.spyOn(PanResponder, 'create');
    await render(<MeditationPlayerScreen />);

    const config = createSpy.mock.calls.at(-1)?.[0] as PanResponderCallbacks;
    const gesture = (dy: number) =>
      ({ dy }) as Parameters<NonNullable<PanResponderCallbacks['onPanResponderRelease']>>[1];
    const event = {} as Parameters<NonNullable<PanResponderCallbacks['onPanResponderRelease']>>[0];

    expect(config.onMoveShouldSetPanResponder?.(event, gesture(-10))).toBe(true);
    expect(config.onMoveShouldSetPanResponder?.(event, gesture(5))).toBe(false);

    await act(async () => {
      config.onPanResponderRelease?.(event, gesture(-20));
    });
    expect(screen.queryByText('Encerrar meditação?')).toBeNull();

    await act(async () => {
      config.onPanResponderRelease?.(event, gesture(-60));
    });
    expect(screen.getByText('Encerrar meditação?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar meditação' }));
    await flushAnimations();

    // A alça é o Pressable dentro da área que recebe os gestos do PanResponder.
    const [handleArea] = screen.container.queryAll(
      (node) => typeof node.props.onMoveShouldSetResponderCapture === 'function',
    );
    const handle = handleArea.children[0];
    if (typeof handle === 'string') {
      throw new Error('alça não encontrada');
    }
    await fireEvent.press(handle);
    expect(screen.getByText('Encerrar meditação?')).toBeTruthy();
    createSpy.mockRestore();
  });

  it('voltar pausa e sai (ou vai para a Home sem histórico)', async () => {
    await render(<MeditationPlayerScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockPlayer.pause).toHaveBeenCalled();
    expect(mockRouter.back).toHaveBeenCalledTimes(1);

    mockRouter.canGoBack.mockReturnValue(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
  });
});
