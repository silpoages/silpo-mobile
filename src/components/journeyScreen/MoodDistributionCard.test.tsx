import { render, screen } from '@testing-library/react-native';
import { MoodDistributionCard } from './MoodDistributionCard';

describe('MoodDistributionCard', () => {
  it('lista só as emoções registradas, da mais para a menos frequente', async () => {
    await render(<MoodDistributionCard moodCounts={{ BEM: 1, ANSIOSO: 5, TRISTE: 0 }} />);

    expect(screen.getByRole('header', { name: 'Como você tem se sentido' })).toBeOnTheScreen();
    const labels = screen
      .getAllByLabelText(/: \d+ dias?$/)
      .map((row) => row.props.accessibilityLabel);
    expect(labels).toEqual(['Ansiedade: 5 dias', 'Bem: 1 dia']);
    expect(screen.queryByText('Tristeza')).toBeNull();
    expect(screen.queryByText('Nenhuma emoção registrada este mês.')).toBeNull();
  });

  it('mostra a nota quando nenhuma emoção foi registrada', async () => {
    await render(<MoodDistributionCard moodCounts={{}} />);

    expect(screen.getByText('Nenhuma emoção registrada este mês.')).toBeOnTheScreen();
    expect(
      screen.getByText('Todas as emoções têm lugar aqui. Registrar já é cuidar.'),
    ).toBeOnTheScreen();
  });
});
