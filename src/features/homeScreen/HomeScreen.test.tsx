import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import HomeRoute from '../../../app/(tabs)/index';
import { HomeScreen } from '@/features/homeScreen/HomeScreen';
import { getTodayDailyMessage } from '@/features/homeScreen/dailyMessageService';
import { getDailyGoodPractice } from '@/features/goodPracticesScreen/goodPracticesService';

const mockUseSession = jest.fn();
const mockUseJourney = jest.fn();
const mockRefreshJourney = jest.fn();

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockUseSession(),
}));
jest.mock('@/features/journeyScreen/useJourney', () => ({
  useJourney: () => mockUseJourney(),
}));
jest.mock('@/features/homeScreen/dailyMessageService', () => ({
  getTodayDailyMessage: jest.fn(),
}));
jest.mock('@/features/goodPracticesScreen/goodPracticesService', () => ({
  getDailyGoodPractice: jest.fn(),
}));
// A linha de emoções tem testes próprios; aqui só importa que ela avisa a Home.
jest.mock('@/components/emotions/EmotionsRow', () => {
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    EmotionsRow: ({ onMoodRegistered }: { onMoodRegistered?: () => void }) => (
      <Pressable onPress={onMoodRegistered}>
        <Text>registrar emoção</Text>
      </Pressable>
    ),
  };
});

const mockGetTodayDailyMessage = jest.mocked(getTodayDailyMessage);
const mockGetDailyGoodPractice = jest.mocked(getDailyGoodPractice);

const practice = {
  id: 'p1',
  title: 'Gratidão',
  description: 'Agradeça por algo',
  completedToday: false,
};

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
  mockUseSession.mockReturnValue({
    token: 'tok',
    user: { id: 'u1', email: 'ana@x.com', fullName: '  Ana Souza ' },
  });
  mockUseJourney.mockReturnValue({ journey: { daysRegistered: 3 }, refresh: mockRefreshJourney });
  mockGetTodayDailyMessage.mockResolvedValue('Mensagem do dia');
  mockGetDailyGoodPractice.mockResolvedValue(practice);
});

describe('HomeScreen', () => {
  it('a rota renderiza a Home', async () => {
    await render(<HomeRoute />);

    expect(await screen.findByText('Gratidão')).toBeOnTheScreen();
  });

  it('mostra saudação, mensagem do dia, prática e jornada', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText(/Ana Souza$/)).toBeOnTheScreen();
    expect(await screen.findByText('Mensagem do dia')).toBeOnTheScreen();
    expect(await screen.findByText('Gratidão')).toBeOnTheScreen();
    expect(screen.getByText('Agradeça por algo')).toBeOnTheScreen();
    expect(
      screen.getByText('Você registrou como estava se sentindo em 3 dias este mês.'),
    ).toBeOnTheScreen();
    expect(mockGetTodayDailyMessage).toHaveBeenCalledWith('tok');
    expect(mockGetDailyGoodPractice).toHaveBeenCalledWith('tok');
  });

  it('usa o e-mail quando não há nome e mantém o subtítulo padrão se a mensagem vier vazia', async () => {
    mockUseSession.mockReturnValue({
      token: 'tok',
      user: { id: 'u1', email: 'ana@x.com', fullName: null },
    });
    mockGetTodayDailyMessage.mockResolvedValue(null);
    mockUseJourney.mockReturnValue({ journey: null, refresh: mockRefreshJourney });
    await render(<HomeScreen />);

    expect(screen.getByText(/ana@x\.com$/)).toBeOnTheScreen();
    await screen.findByText('Gratidão');
    expect(screen.getByText('Seus sentimentos importam')).toBeOnTheScreen();
    expect(screen.getByText('Veja como foi o seu mês até aqui.')).toBeOnTheScreen();
  });

  it('volta ao subtítulo padrão se a mensagem do dia falhar', async () => {
    mockGetTodayDailyMessage.mockRejectedValue(new Error('offline'));
    await render(<HomeScreen />);

    await screen.findByText('Gratidão');
    expect(screen.getByText('Seus sentimentos importam')).toBeOnTheScreen();
  });

  it('reaproveita a mensagem do dia no mesmo dia', async () => {
    const view = await render(<HomeScreen />);
    await screen.findByText('Mensagem do dia');

    mockUseSession.mockReturnValue({
      token: 'tok-2',
      user: { id: 'u1', email: 'ana@x.com', fullName: 'Ana' },
    });
    await view.rerender(<HomeScreen />);

    await waitFor(() => expect(mockGetDailyGoodPractice).toHaveBeenCalledWith('tok-2'));
    expect(mockGetTodayDailyMessage).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Mensagem do dia')).toBeOnTheScreen();
  });

  it('mostra carregamento enquanto a prática do dia não chega', async () => {
    mockGetDailyGoodPractice.mockReturnValue(new Promise(() => {}));
    await render(<HomeScreen />);

    expect(screen.getByText('Carregando prática do dia...')).toBeOnTheScreen();
    expect(screen.queryByText('Quero tentar')).not.toBeOnTheScreen();
  });

  it('sem sessão mostra estado vazio sem chamar a API', async () => {
    mockUseSession.mockReturnValue({ token: null, user: null });
    await render(<HomeScreen />);

    expect(screen.getByText('Nenhuma prática disponível')).toBeOnTheScreen();
    expect(screen.getByText('Seus sentimentos importam')).toBeOnTheScreen();
    expect(screen.queryByText('Quero tentar')).not.toBeOnTheScreen();
    expect(mockGetDailyGoodPractice).not.toHaveBeenCalled();
    expect(mockGetTodayDailyMessage).not.toHaveBeenCalled();
  });

  it('mostra estado vazio quando não há prática do dia', async () => {
    mockGetDailyGoodPractice.mockResolvedValue(null);
    await render(<HomeScreen />);

    expect(await screen.findByText('Nenhuma prática disponível')).toBeOnTheScreen();
  });

  it('mostra erro quando a prática do dia falha', async () => {
    mockGetDailyGoodPractice.mockRejectedValue(new Error('offline'));
    await render(<HomeScreen />);

    expect(await screen.findByText('Não foi possível carregar a prática')).toBeOnTheScreen();
    expect(screen.getByText('Verifique sua conexão e tente novamente.')).toBeOnTheScreen();
  });

  it('abre a prática do dia com os parâmetros', async () => {
    await render(<HomeScreen />);
    await screen.findByText('Gratidão');

    await fireEvent.press(screen.getByText('Quero tentar'));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/praticas-do-bem',
      params: {
        id: 'p1',
        title: 'Gratidão',
        description: 'Agradeça por algo',
        source: 'daily',
      },
    });
  });

  it('navega para perfil, outras práticas, jornada e exercícios rápidos', async () => {
    await render(<HomeScreen />);
    await screen.findByText('Gratidão');

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));
    await fireEvent.press(screen.getByText('Ver outras'));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue sua jornada' }));
    await fireEvent.press(screen.getByText('Respiração'));
    await fireEvent.press(screen.getByText('Meditação'));
    await fireEvent.press(screen.getByText('Um momento'));

    expect(mockRouter.push.mock.calls).toEqual([
      ['/perfil'],
      ['/praticas'],
      ['/jornada'],
      ['/respiracao'],
      ['/meditations'],
      ['/bolinhas'],
    ]);
  });

  it('atualiza a jornada quando uma emoção é registrada', async () => {
    await render(<HomeScreen />);
    await screen.findByText('Gratidão');

    await fireEvent.press(screen.getByText('registrar emoção'));

    expect(mockRefreshJourney).toHaveBeenCalled();
  });

  it('ignora respostas que chegam depois de sair da tela', async () => {
    const message = deferred<string | null>();
    const dailyPractice = deferred<typeof practice | null>();
    mockGetTodayDailyMessage.mockReturnValue(message.promise);
    mockGetDailyGoodPractice.mockReturnValue(dailyPractice.promise);

    const view = await render(<HomeScreen />);
    await view.unmount();

    await act(async () => {
      message.resolve('tarde demais');
      dailyPractice.resolve(practice);
    });

    expect(mockGetDailyGoodPractice).toHaveBeenCalled();
  });

  it('ignora falhas que chegam depois de sair da tela', async () => {
    const message = deferred<string | null>();
    const dailyPractice = deferred<typeof practice | null>();
    mockGetTodayDailyMessage.mockReturnValue(message.promise);
    mockGetDailyGoodPractice.mockReturnValue(dailyPractice.promise);

    const view = await render(<HomeScreen />);
    await view.unmount();

    await act(async () => {
      message.reject(new Error('x'));
      dailyPractice.reject(new Error('y'));
    });

    expect(mockGetTodayDailyMessage).toHaveBeenCalled();
  });
});
