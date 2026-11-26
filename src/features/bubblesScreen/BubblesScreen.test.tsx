import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import BubblesRoute from '../../../app/bolinhas';
import { BubblesScreen } from './BubblesScreen';

// O primeiro render da tela (com transformação + cobertura) pode passar de 5s em máquinas carregadas.
jest.setTimeout(20000);

const mockPlayPopSound = jest.fn();

jest.mock('./useBubblePopSound', () => ({
  useBubblePopSound: () => mockPlayPopSound,
}));

function bubbles() {
  return screen.queryAllByRole('button', { name: 'Estourar bolinha' });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockPlayPopSound.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('BubblesScreen', () => {
  it('começa no modo livre com 8 bolinhas', async () => {
    await render(<BubblesScreen />);

    expect(screen.getByText('Estoure as bolinhas')).toBeTruthy();
    expect(bubbles()).toHaveLength(8);
    expect(screen.getByRole('button', { name: 'Livre' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Ritmo' })).not.toBeSelected();
  });

  it('no modo livre, estourar uma bolinha toca o som e cria outra no lugar', async () => {
    await render(<BubblesScreen />);

    await fireEvent.press(bubbles()[0]);
    expect(mockPlayPopSound).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(bubbles()).toHaveLength(8);
  });

  it('no modo ritmo, surge uma bolinha por intervalo e estourar remove', async () => {
    await render(<BubblesScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Ritmo' }));
    expect(screen.getByRole('button', { name: 'Ritmo' })).toBeSelected();
    expect(bubbles()).toHaveLength(1);

    await act(async () => {
      jest.advanceTimersByTime(900 * 2);
    });
    expect(bubbles()).toHaveLength(3);

    await fireEvent.press(bubbles()[0]);
    // O intervalo continua; avança só a animação de estouro (180ms) antes do próximo surgimento.
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(mockPlayPopSound).toHaveBeenCalledTimes(1);
    expect(bubbles()).toHaveLength(2);

    await fireEvent.press(screen.getByRole('button', { name: 'Livre' }));
    expect(bubbles()).toHaveLength(8);
  });

  it('volta para a tela anterior quando possível', async () => {
    await render(<BubblesScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('vai para a Home quando não há histórico', async () => {
    mockRouter.canGoBack.mockReturnValue(false);
    await render(<BubblesRoute />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});
