import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import BreathingRoute from '../../../app/respiracao';
import { ApiError } from '@/services/apiClient';
import { BreathingScreen } from './BreathingScreen';
import {
  createActivitySession,
  getBreathingActivity,
  type BreathingActivity,
} from './activityService';

// O primeiro render da tela (com transformação + cobertura) pode passar de 5s em máquinas carregadas.
jest.setTimeout(20000);

const mockLogout = jest.fn();
const mockCheckForNewAchievements = jest.fn();
let mockSession: { token: string | null; isLoading: boolean; logout: jest.Mock };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));

jest.mock('@/features/achievements/AchievementAlertContext', () => ({
  useAchievementAlerts: () => ({ checkForNewAchievements: mockCheckForNewAchievements }),
}));

jest.mock('./activityService', () => ({
  ...jest.requireActual('./activityService'),
  getBreathingActivity: jest.fn(),
  createActivitySession: jest.fn(),
}));

jest.mock('@expo/vector-icons/Feather', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
  };
});

const getActivityMock = getBreathingActivity as jest.MockedFunction<typeof getBreathingActivity>;
const createSessionMock = createActivitySession as jest.MockedFunction<
  typeof createActivitySession
>;

const SHORT_ACTIVITY: BreathingActivity = {
  id: 'act-1',
  name: 'Curta',
  type: 'breathing',
  maxDurationSeconds: null,
  inhaleSeconds: 1,
  holdSeconds: 2,
  exhaleSeconds: 3,
  repeatCount: 2,
};

async function advance(seconds: number) {
  for (let i = 0; i < seconds; i += 1) {
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  }
}

async function pressPlay() {
  await fireEvent.press(screen.getByText('icon:play'));
}

beforeEach(() => {
  jest.useFakeTimers();
  mockLogout.mockReset().mockResolvedValue(undefined);
  mockCheckForNewAchievements.mockReset();
  getActivityMock.mockReset();
  createSessionMock.mockReset();
  mockSession = { token: 'tok', isLoading: false, logout: mockLogout };
});

afterEach(() => {
  jest.useRealTimers();
});

describe('BreathingScreen — estados de carregamento', () => {
  it('mostra carregando enquanto a sessão é restaurada', async () => {
    mockSession = { token: null, isLoading: true, logout: mockLogout };
    await render(<BreathingScreen />);

    expect(screen.getByText('Carregando exercício...')).toBeTruthy();
    expect(getActivityMock).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('mostra carregando enquanto busca a atividade', async () => {
    getActivityMock.mockReturnValue(new Promise(() => {}));
    await render(<BreathingScreen />);

    expect(screen.getByText('Carregando exercício...')).toBeTruthy();
    expect(getActivityMock).toHaveBeenCalledWith('tok');
  });

  it('mostra o erro da API e permite tentar de novo', async () => {
    getActivityMock
      .mockRejectedValueOnce(new Error('Nenhuma atividade de respiração está disponível.'))
      .mockResolvedValueOnce(SHORT_ACTIVITY);
    await render(<BreathingScreen />);

    expect(await screen.findByText('Não foi possível abrir a respiração')).toBeTruthy();
    expect(screen.getByText('Nenhuma atividade de respiração está disponível.')).toBeTruthy();

    await fireEvent.press(screen.getByText('Tentar novamente'));

    expect(await screen.findByText('Inspire')).toBeTruthy();
    expect(getActivityMock).toHaveBeenCalledTimes(2);
  });

  it('usa mensagem genérica quando o erro não é um Error', async () => {
    getActivityMock.mockRejectedValueOnce('falhou');
    await render(<BreathingScreen />);

    expect(await screen.findByText('Não foi possível carregar a atividade.')).toBeTruthy();
  });

  it('pede login quando a sessão expirou (401)', async () => {
    getActivityMock.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));
    await render(<BreathingScreen />);

    expect(
      await screen.findByText('Sua sessão expirou. Entre novamente para continuar.'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Entrar'));
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('descarta a resposta se a tela foi desmontada', async () => {
    let resolve: (value: BreathingActivity) => void = () => {};
    getActivityMock.mockReturnValueOnce(
      new Promise<BreathingActivity>((r) => {
        resolve = r;
      }),
    );
    const { unmount } = await render(<BreathingScreen />);
    await unmount();

    await act(async () => {
      resolve(SHORT_ACTIVITY);
    });
    expect(screen.queryByText('Inspire')).toBeNull();
  });

  it('descarta o erro se a tela foi desmontada', async () => {
    let reject: (reason: unknown) => void = () => {};
    getActivityMock.mockReturnValueOnce(
      new Promise<BreathingActivity>((_r, rj) => {
        reject = rj;
      }),
    );
    const { unmount } = await render(<BreathingScreen />);
    await unmount();

    await act(async () => {
      reject(new Error('x'));
    });
    expect(screen.queryByText('x')).toBeNull();
  });
});

describe('BreathingScreen — visitante', () => {
  beforeEach(() => {
    mockSession = { token: null, isLoading: false, logout: mockLogout };
  });

  it('usa a respiração 4-7-8 local e não registra a prática', async () => {
    await render(<BreathingRoute />);

    expect(getActivityMock).not.toHaveBeenCalled();
    expect(screen.getByText('Inspire')).toBeTruthy();
    expect(screen.getByText('0s · 0/4 ciclos completos')).toBeTruthy();

    await pressPlay();
    await advance(4);
    expect(screen.getByText('Segure')).toBeTruthy();
    await advance(7);
    expect(screen.getByText('Expire')).toBeTruthy();
    await advance(8);
    expect(screen.getByText('0s · 1/4 ciclos completos')).toBeTruthy();

    await advance(19 * 3);
    expect(screen.getByText('Prática encerrada')).toBeTruthy();
    expect(
      screen.getByText('Entre na sua conta para guardar suas práticas na jornada.'),
    ).toBeTruthy();
    expect(screen.queryByText('icon:pause')).toBeNull();
    expect(createSessionMock).not.toHaveBeenCalled();
  });
});

describe('BreathingScreen — prática com login', () => {
  async function renderLoaded(activity: BreathingActivity = SHORT_ACTIVITY) {
    getActivityMock.mockResolvedValue(activity);
    await render(<BreathingScreen />);
    await screen.findByText('Inspire');
  }

  it('pausa e retoma a contagem', async () => {
    await renderLoaded();

    await pressPlay();
    await advance(1);
    expect(screen.getByText('Segure')).toBeTruthy();

    await fireEvent.press(screen.getByText('icon:pause'));
    await advance(3);
    expect(screen.getByText('Segure')).toBeTruthy();
    expect(screen.getByText('0s · 0/2 ciclos completos')).toBeTruthy();

    await pressPlay();
    await advance(1);
    expect(screen.getByText('1s · 0/2 ciclos completos')).toBeTruthy();
  });

  it('registra a prática ao final e verifica conquistas', async () => {
    let resolveSession: () => void = () => {};
    createSessionMock.mockReturnValueOnce(
      new Promise((r) => {
        resolveSession = () =>
          r({ id: 's', activityId: 'act-1', timeSpentSeconds: 12, completedAt: 'x' });
      }),
    );
    await renderLoaded();

    await pressPlay();
    await advance(12);

    expect(screen.getByText('Prática encerrada')).toBeTruthy();
    expect(screen.getByText('Registrando sua prática...')).toBeTruthy();
    expect(createSessionMock).toHaveBeenCalledWith('tok', 'act-1', 12);

    await act(async () => {
      resolveSession();
    });
    expect(screen.getByText('Prática registrada na sua jornada.')).toBeTruthy();
    expect(mockCheckForNewAchievements).toHaveBeenCalledTimes(1);
    expect(createSessionMock).toHaveBeenCalledTimes(1);
  });

  it('limita a prática pela duração máxima', async () => {
    createSessionMock.mockResolvedValue({
      id: 's',
      activityId: 'act-1',
      timeSpentSeconds: 4,
      completedAt: 'x',
    });
    await renderLoaded({ ...SHORT_ACTIVITY, maxDurationSeconds: 4 });

    await pressPlay();
    await advance(4);

    expect(screen.getByText('Prática encerrada')).toBeTruthy();
    expect(createSessionMock).toHaveBeenCalledWith('tok', 'act-1', 4);
  });

  it('permite tentar registrar de novo após uma falha', async () => {
    createSessionMock.mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce({
      id: 's',
      activityId: 'act-1',
      timeSpentSeconds: 12,
      completedAt: 'x',
    });
    await renderLoaded();

    await pressPlay();
    await advance(12);

    expect(screen.getByText('Não foi possível registrar a prática.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar registrar de novo' }));

    expect(await screen.findByText('Prática registrada na sua jornada.')).toBeTruthy();
    expect(createSessionMock).toHaveBeenCalledTimes(2);
  });

  it('encerra a sessão quando o registro volta 401', async () => {
    createSessionMock.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));
    await renderLoaded();

    await pressPlay();
    await advance(12);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Sua sessão expirou. Entre novamente para continuar.')).toBeTruthy();
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('abre e fecha o guia de respiração com as durações da atividade', async () => {
    await renderLoaded();
    await pressPlay();

    await fireEvent.press(screen.getByText('icon:more-horizontal'));
    expect(screen.getByText('Como respirar corretamente')).toBeTruthy();
    expect(screen.getByText('1 segundos')).toBeTruthy();
    expect(screen.getByText('2 segundos')).toBeTruthy();
    expect(screen.getByText('3 segundos')).toBeTruthy();
    // Abrir o guia pausa a prática.
    expect(screen.getByText('icon:play')).toBeTruthy();

    const [modal] = screen.container.queryAll((node) => node.props.onRequestClose != null);
    await fireEvent(modal, 'requestClose');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByText('Como respirar corretamente')).toBeNull();
  });

  it('encerrar a prática volta para a tela anterior', async () => {
    await renderLoaded();

    await fireEvent.press(screen.getByText('Encerrar Prática'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('encerrar sem histórico vai para a Home', async () => {
    mockRouter.canGoBack.mockReturnValue(false);
    await renderLoaded();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
  });
});
