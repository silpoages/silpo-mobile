import { fireEvent, render, screen } from '@testing-library/react-native';
import { AchievementsSummaryCard } from './AchievementsSummaryCard';

describe('AchievementsSummaryCard', () => {
  it('é um botão quando recebe onPress', async () => {
    const onPress = jest.fn();
    await render(<AchievementsSummaryCard unlocked={2} total={5} onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Minhas conquistas: 2 de 5 descobertas' });
    expect(screen.getByText('2 de 5 descobertas')).toBeOnTheScreen();

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('sem onPress, fica desabilitado e não é botão', async () => {
    await render(<AchievementsSummaryCard unlocked={0} total={1} />);

    expect(screen.queryByRole('button')).toBeNull();
    const card = screen.getByLabelText('Minhas conquistas: 0 de 1 descoberta');
    expect(card).toBeDisabled();
  });
});
