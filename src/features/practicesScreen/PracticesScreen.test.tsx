import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import PracticesRoute from '../../../app/praticas';
import { listGoodPractices } from '@/features/goodPracticesScreen/goodPracticesService';
import { PracticesScreen } from '@/features/practicesScreen/PracticesScreen';

const mockUseSession = jest.fn();

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockUseSession(),
}));
jest.mock('@/features/goodPracticesScreen/goodPracticesService', () => ({
  listGoodPractices: jest.fn(),
}));

const mockListGoodPractices = jest.mocked(listGoodPractices);

const practices = [
  { id: 'p1', title: 'Gratidão', description: 'Agradeça' },
  { id: 'p2', title: 'Caminhada', description: 'Caminhe' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSession.mockReturnValue({ token: 'tok' });
  mockListGoodPractices.mockResolvedValue(practices);
});

describe('PracticesScreen', () => {
  it('a rota renderiza a lista', async () => {
    await render(<PracticesRoute />);

    expect(await screen.findByText('Gratidão')).toBeOnTheScreen();
  });

  it('mostra carregamento enquanto busca', async () => {
    mockListGoodPractices.mockReturnValue(new Promise(() => {}));
    await render(<PracticesScreen />);

    expect(screen.getByText('Carregando práticas...')).toBeOnTheScreen();
    expect(screen.getByText('Outras práticas')).toBeOnTheScreen();
  });

  it('lista as práticas e abre a escolhida', async () => {
    await render(<PracticesScreen />);

    expect(await screen.findByText('Caminhada')).toBeOnTheScreen();
    expect(mockListGoodPractices).toHaveBeenCalledWith('tok');

    await fireEvent.press(screen.getByRole('button', { name: 'Quero tentar: Caminhada' }));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/praticas-do-bem',
      params: { id: 'p2', title: 'Caminhada', description: 'Caminhe', source: 'other' },
    });
  });

  it('mostra estado vazio', async () => {
    mockListGoodPractices.mockResolvedValue([]);
    await render(<PracticesScreen />);

    expect(await screen.findByText('Nenhuma prática disponível')).toBeOnTheScreen();
  });

  it('mostra erro sem sessão', async () => {
    mockUseSession.mockReturnValue({ token: null });
    await render(<PracticesScreen />);

    expect(screen.getByText('Não foi possível carregar as práticas')).toBeOnTheScreen();
    expect(mockListGoodPractices).not.toHaveBeenCalled();
  });

  it('mostra erro na falha e recarrega ao tentar de novo', async () => {
    mockListGoodPractices.mockRejectedValueOnce(new Error('offline'));
    await render(<PracticesScreen />);

    expect(await screen.findByText('Verifique sua conexão e tente de novo.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Gratidão')).toBeOnTheScreen();
    expect(mockListGoodPractices).toHaveBeenCalledTimes(2);
  });
});
