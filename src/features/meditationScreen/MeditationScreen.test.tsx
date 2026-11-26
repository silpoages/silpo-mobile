import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import MeditationRoute from '../../../app/meditations';
import { listMeditations, type Meditation } from './meditationService';
import { MeditationScreen } from './MeditationScreen';

// O primeiro render da tela (com transformação + cobertura) pode passar de 5s em máquinas carregadas.
jest.setTimeout(20000);

// Objeto estável: o hook usa `logout` como dependência do efeito de carregamento.
const mockSession = { token: 'tok', user: { id: 'u1' }, logout: jest.fn() };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));

jest.mock('./meditationService', () => ({ listMeditations: jest.fn() }));

const listMock = listMeditations as jest.MockedFunction<typeof listMeditations>;

const CALMA: Meditation = {
  id: 'm1',
  title: 'Calma',
  description: 'Para desacelerar',
  durationSeconds: 125,
  audioUrl: 'https://a/1.mp3',
};

const FOCO: Meditation = {
  id: 'm2',
  title: 'Foco',
  description: '',
  durationSeconds: null,
  audioUrl: 'https://a/2.mp3',
};

beforeEach(() => {
  listMock.mockReset();
});

describe('MeditationScreen', () => {
  it('mostra o carregamento', async () => {
    listMock.mockReturnValue(new Promise(() => {}));
    await render(<MeditationRoute />);

    expect(screen.getByText('Meditações')).toBeTruthy();
    expect(screen.getByText('Carregando meditações...')).toBeTruthy();
  });

  it('mostra erro e tenta de novo', async () => {
    listMock.mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce([CALMA]);
    await render(<MeditationScreen />);

    expect(await screen.findByText('Não foi possível carregar as meditações')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Calma')).toBeTruthy();
  });

  it('lista as meditações com a duração em minutos', async () => {
    listMock.mockResolvedValueOnce([CALMA, FOCO]);
    await render(<MeditationScreen />);

    expect(await screen.findByText('MEDITAÇÃO GUIADA · 3 MIN')).toBeTruthy();
    expect(screen.getByText('MEDITAÇÃO GUIADA · 0 MIN')).toBeTruthy();
    expect(screen.getByText('Para desacelerar')).toBeTruthy();
    expect(screen.getByText('Foco')).toBeTruthy();
  });

  it('sem meditações sugere respiração e volta para o início', async () => {
    listMock.mockResolvedValueOnce([]);
    await render(<MeditationScreen />);

    expect(await screen.findByText('Ainda não há meditações disponíveis')).toBeTruthy();
    await fireEvent.press(screen.getByRole('link', { name: 'Voltar para o início' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
  });

  it('seleciona uma meditação e inicia o player com os parâmetros', async () => {
    listMock.mockResolvedValueOnce([CALMA, FOCO]);
    await render(<MeditationScreen />);
    await screen.findByText('Calma');

    await fireEvent.press(screen.getAllByRole('button', { name: 'Ouvir Meditação' })[0]);
    expect(screen.getByText('ANTES DE COMEÇAR')).toBeTruthy();
    expect(screen.getByText('Se puder, use fones de ouvido.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Começar meditação' }));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/meditation-player',
      params: {
        meditation_id: 'm1',
        title: 'Calma',
        audio_url: 'https://a/1.mp3',
        max_time_seconds: '125',
      },
    });
  });

  it('não envia max_time_seconds sem duração', async () => {
    listMock.mockResolvedValueOnce([FOCO]);
    await render(<MeditationScreen />);
    await screen.findByText('Foco');

    await fireEvent.press(screen.getByRole('button', { name: 'Ouvir Meditação' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Começar meditação' }));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/meditation-player',
      params: { meditation_id: 'm2', title: 'Foco', audio_url: 'https://a/2.mp3' },
    });
  });

  it('voltar com uma meditação selecionada retorna à lista', async () => {
    listMock.mockResolvedValueOnce([CALMA]);
    await render(<MeditationScreen />);
    await screen.findByText('Calma');

    await fireEvent.press(screen.getByRole('button', { name: 'Ouvir Meditação' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Agora não' }));
    expect(screen.getByText('Meditações')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Ouvir Meditação' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByText('Meditações')).toBeTruthy();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('voltar na lista sai da tela (ou vai para a Home sem histórico)', async () => {
    listMock.mockResolvedValue([]);
    await render(<MeditationScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);

    mockRouter.canGoBack.mockReturnValue(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
  });
});
