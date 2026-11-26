import { fireEvent, render, screen } from '@testing-library/react-native';
import { ContinueJourneyCard } from './ContinueJourneyCard';

describe('ContinueJourneyCard', () => {
  it.each([
    [null, 'Veja como foi o seu mês até aqui.'],
    [0, 'Registre como você está se sentindo para começar a sua jornada.'],
    [1, 'Você registrou como estava se sentindo em 1 dia este mês.'],
    [6, 'Você registrou como estava se sentindo em 6 dias este mês.'],
  ])('com %p dias mostra "%s"', async (daysRegistered, description) => {
    await render(<ContinueJourneyCard daysRegistered={daysRegistered} onPress={jest.fn()} />);

    expect(screen.getByText('Continue sua jornada')).toBeOnTheScreen();
    expect(screen.getByText(description)).toBeOnTheScreen();
  });

  it('chama onPress ao tocar', async () => {
    const onPress = jest.fn();
    await render(<ContinueJourneyCard daysRegistered={2} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continue sua jornada' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
