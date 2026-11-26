import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import { Header } from '@/components/practicesScreen/Header';
import { PracticeCard } from '@/components/practicesScreen/PracticeCard';

const practice = { id: 'p1', title: 'Gratidão', description: 'Agradeça' };

describe('PracticeCard', () => {
  it('mostra a prática e informa qual foi escolhida', async () => {
    const onPress = jest.fn();
    await render(<PracticeCard practice={practice} onPress={onPress} />);

    expect(screen.getByText('PRÁTICA DO BEM')).toBeOnTheScreen();
    expect(screen.getByText('Agradeça')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Quero tentar: Gratidão' }));

    expect(onPress).toHaveBeenCalledWith(practice);
  });

  it('não quebra sem onPress', async () => {
    await render(<PracticeCard practice={practice} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Quero tentar: Gratidão' }));
    expect(screen.getByText('Gratidão')).toBeOnTheScreen();
  });
});

describe('Header (outras práticas)', () => {
  it('mostra título e volta quando há histórico', async () => {
    await render(<Header />);

    expect(screen.getByText('Outras práticas')).toBeOnTheScreen();
    expect(screen.getByText('Vá no ritmo que fizer sentido para você.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(mockRouter.back).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('vai para a Home quando não há histórico', async () => {
    mockRouter.canGoBack.mockReturnValue(false);
    await render(<Header />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});
