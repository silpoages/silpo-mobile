import { render, screen } from '@testing-library/react-native';
import AchievementsRoute from '../../app/conquistas';

jest.mock('@/features/achievementsScreen/AchievementsScreen', () => {
  const { Text } = require('react-native');
  return { AchievementsScreen: () => <Text>AchievementsScreen</Text> };
});

it('a rota /conquistas só renderiza a AchievementsScreen', async () => {
  await render(<AchievementsRoute />);

  expect(screen.getByText('AchievementsScreen')).toBeOnTheScreen();
});
