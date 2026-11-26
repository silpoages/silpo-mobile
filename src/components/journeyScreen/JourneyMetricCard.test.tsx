import { render, screen } from '@testing-library/react-native';
import { JourneyMetricCard } from './JourneyMetricCard';

it('mostra valor e rótulo e os combina no rótulo acessível', async () => {
  await render(<JourneyMetricCard value={3} label="exercícios concluídos" />);

  expect(screen.getByText('3')).toBeOnTheScreen();
  expect(screen.getByText('exercícios concluídos')).toBeOnTheScreen();
  expect(screen.getByLabelText('3 exercícios concluídos')).toBeOnTheScreen();
});
