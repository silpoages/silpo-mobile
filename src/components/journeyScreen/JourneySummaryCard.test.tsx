import { render, screen } from '@testing-library/react-native';
import { JourneySummaryCard } from './JourneySummaryCard';

describe('JourneySummaryCard', () => {
  it('usa "dias" no plural', async () => {
    await render(<JourneySummaryCard daysRegistered={4} />);

    expect(screen.getByText('Sua jornada até aqui')).toBeOnTheScreen();
    expect(
      screen.getByText('Você registrou como estava se sentindo em 4 dias este mês.'),
    ).toBeOnTheScreen();
  });

  it('usa "dia" no singular', async () => {
    await render(<JourneySummaryCard daysRegistered={1} />);

    expect(
      screen.getByText('Você registrou como estava se sentindo em 1 dia este mês.'),
    ).toBeOnTheScreen();
  });
});
