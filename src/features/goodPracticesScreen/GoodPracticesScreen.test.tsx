import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter, setMockSearchParams } from '@test/mocks/expoRouter';

import GoodPracticesRoute from '../../../app/praticas-do-bem';
import { GoodPracticesScreen } from '@/features/goodPracticesScreen/GoodPracticesScreen';
import {
  completeGoodPractice,
  getDailyGoodPractice,
  type DailyGoodPractice,
} from '@/features/goodPracticesScreen/goodPracticesService';

const mockUseSession = jest.fn();
const mockCheckForNewAchievements = jest.fn();

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockUseSession(),
}));
jest.mock('@/features/achievements/AchievementAlertContext', () => ({
  useAchievementAlerts: () => ({ checkForNewAchievements: mockCheckForNewAchievements }),
}));
jest.mock('@/features/goodPracticesScreen/goodPracticesService', () => ({
  completeGoodPractice: jest.fn(),
  getDailyGoodPractice: jest.fn(),
}));

const mockCompleteGoodPractice = jest.mocked(completeGoodPractice);
const mockGetDailyGoodPractice = jest.mocked(getDailyGoodPractice);

const dailyPractice: DailyGoodPractice = {
  id: 'p1',
  title: 'Gratidão',
  description: 'Agradeça',
  completedToday: false,
};

function renderScreen(props: Partial<Parameters<typeof GoodPracticesScreen>[0]> = {}) {
  return render(<GoodPracticesScreen id="p1" title="Gratidão" description="Agradeça" {...props} />);
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

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSession.mockReturnValue({ token: 'tok', user: { id: 'u1' } });
  mockCompleteGoodPractice.mockResolvedValue(undefined);
  mockGetDailyGoodPractice.mockResolvedValue(dailyPractice);
});

describe('GoodPracticesRoute', () => {
  it('mostra "Prática indisponível" sem id ou título', async () => {
    setMockSearchParams({ title: 'Sem id' });
    await render(<GoodPracticesRoute />);

    expect(screen.getByText('Prática indisponível')).toBeOnTheScreen();
    expect(screen.getByText('Volte e escolha uma prática da lista.')).toBeOnTheScreen();
  });

  it('usa o primeiro valor de parâmetros repetidos', async () => {
    setMockSearchParams({ id: ['p9', 'p8'], title: ['Título', 'x'], description: [] });
    await render(<GoodPracticesRoute />);

    expect(screen.getByText('Título')).toBeOnTheScreen();
    expect(mockGetDailyGoodPractice).not.toHaveBeenCalled();
  });

  it('com source=daily consulta a prática do dia', async () => {
    setMockSearchParams({ id: 'p1', title: 'Gratidão', description: 'Agradeça', source: 'daily' });
    await render(<GoodPracticesRoute />);

    expect(await screen.findByTestId('start-practice-button')).toBeOnTheScreen();
    expect(mockGetDailyGoodPractice).toHaveBeenCalledWith('tok');
  });

  it('trata array vazio como parâmetro ausente', async () => {
    setMockSearchParams({ id: [], title: 'x' });
    await render(<GoodPracticesRoute />);

    expect(screen.getByText('Prática indisponível')).toBeOnTheScreen();
  });
});

describe('GoodPracticesScreen', () => {
  it('mostra a prática e os passos', async () => {
    await renderScreen();

    expect(screen.getByText('Prática do bem')).toBeOnTheScreen();
    expect(screen.getByText('Gratidão')).toBeOnTheScreen();
    expect(screen.getByText('Agradeça')).toBeOnTheScreen();
    expect(screen.getByText('Respire fundo uma vez antes de começar.')).toBeOnTheScreen();
    expect(screen.getByText('Se preferir voltar, tudo bem. Tentar já conta.')).toBeOnTheScreen();
    expect(screen.queryByText('Prática iniciada')).not.toBeOnTheScreen();
    expect(mockGetDailyGoodPractice).not.toHaveBeenCalled();
  });

  it('começa, conclui, verifica conquistas e volta', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByTestId('start-practice-button'));
    expect(screen.getByText('Prática iniciada')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('finish-practice-button'));

    expect(mockCompleteGoodPractice).toHaveBeenCalledWith('tok', 'p1');
    expect(mockCheckForNewAchievements).toHaveBeenCalled();
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('mostra erro quando não consegue concluir', async () => {
    mockCompleteGoodPractice.mockRejectedValue(new Error('offline'));
    await renderScreen();

    await fireEvent.press(screen.getByTestId('start-practice-button'));
    await fireEvent.press(screen.getByTestId('finish-practice-button'));

    expect(screen.getByText('Não foi possível concluir agora. Tente novamente.')).toBeOnTheScreen();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('não conclui sem sessão', async () => {
    mockUseSession.mockReturnValue({ token: null, user: null });
    await renderScreen();

    await fireEvent.press(screen.getByTestId('start-practice-button'));
    await fireEvent.press(screen.getByTestId('finish-practice-button'));

    expect(mockCompleteGoodPractice).not.toHaveBeenCalled();
  });

  it('"Deixar para depois" volta', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByTestId('start-practice-button'));
    await fireEvent.press(screen.getByTestId('postpone-practice-button'));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('"Agora não" vai para a Home quando não há histórico', async () => {
    mockRouter.canGoBack.mockReturnValue(false);
    await renderScreen();

    await fireEvent.press(screen.getByTestId('dismiss-practice-button'));

    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
  });

  it('o botão voltar do topo fecha a tela', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  describe('prática do dia', () => {
    it('mostra carregamento enquanto consulta o status', async () => {
      mockGetDailyGoodPractice.mockReturnValue(new Promise(() => {}));
      await renderScreen({ isDailyPractice: true });

      expect(screen.queryByTestId('start-practice-button')).not.toBeOnTheScreen();
    });

    it('já concluída hoje mostra o selo e só "Voltar"', async () => {
      mockGetDailyGoodPractice.mockResolvedValue({ ...dailyPractice, completedToday: true });
      await renderScreen({ isDailyPractice: true });

      expect(await screen.findByText('Prática concluída hoje')).toBeOnTheScreen();
      expect(screen.queryByTestId('start-practice-button')).not.toBeOnTheScreen();

      // Além da seta do topo, o rodapé ganha um botão "Voltar".
      const backButtons = screen.getAllByRole('button', { name: 'Voltar' });
      expect(backButtons).toHaveLength(2);
      await fireEvent.press(backButtons[1]);
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('ao concluir a do dia, fica na tela com o selo de concluída', async () => {
      await renderScreen({ isDailyPractice: true });

      await fireEvent.press(await screen.findByTestId('start-practice-button'));
      await fireEvent.press(screen.getByTestId('finish-practice-button'));

      expect(mockCompleteGoodPractice).toHaveBeenCalledWith('tok', 'p1');
      expect(screen.getByText('Prática concluída hoje')).toBeOnTheScreen();
      expect(screen.queryByText('Prática iniciada')).not.toBeOnTheScreen();
      expect(mockRouter.back).not.toHaveBeenCalled();
    });

    it('se a do dia for outra, se comporta como prática comum', async () => {
      mockGetDailyGoodPractice.mockResolvedValue({ ...dailyPractice, id: 'outra' });
      await renderScreen({ isDailyPractice: true });

      await fireEvent.press(await screen.findByTestId('start-practice-button'));
      await fireEvent.press(screen.getByTestId('finish-practice-button'));

      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('se a consulta falhar, se comporta como prática comum', async () => {
      mockGetDailyGoodPractice.mockRejectedValue(new Error('offline'));
      await renderScreen({ isDailyPractice: true });

      expect(await screen.findByTestId('start-practice-button')).toBeOnTheScreen();
    });

    it('ignora respostas depois de sair da tela', async () => {
      const first = deferred<DailyGoodPractice | null>();
      const second = deferred<DailyGoodPractice | null>();
      mockGetDailyGoodPractice
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);

      const firstView = await renderScreen({ isDailyPractice: true });
      await firstView.unmount();
      const secondView = await renderScreen({ isDailyPractice: true });
      await secondView.unmount();

      await act(async () => {
        first.resolve(dailyPractice);
        second.reject(new Error('x'));
      });

      expect(mockGetDailyGoodPractice).toHaveBeenCalledTimes(2);
    });
  });
});
