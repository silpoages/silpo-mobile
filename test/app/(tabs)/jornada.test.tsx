import { render, screen } from '@testing-library/react-native';
import { JourneyScreen } from '@/features/journeyScreen/JourneyScreen';
import { useJourney } from '@/features/journeyScreen/useJourney';
import JourneyRoute from '../../../app/(tabs)/jornada';

jest.mock('@/features/journeyScreen/useJourney', () => ({ useJourney: jest.fn() }));
jest.mock('@/features/journeyScreen/JourneyScreen', () => {
  const { Text } = require('react-native');
  return { JourneyScreen: jest.fn(() => <Text>JourneyScreen</Text>) };
});

it('a aba Jornada liga o useJourney à JourneyScreen', async () => {
  const retry = jest.fn();
  const journey = {
    daysRegistered: 1,
    practicesTried: 0,
    exercisesCompleted: 0,
    moodCounts: {},
    achievements: { unlocked: 0, total: 1 },
  };
  jest.mocked(useJourney).mockReturnValue({
    journey,
    isLoading: false,
    hasError: true,
    refresh: jest.fn(),
    retry,
  });

  await render(<JourneyRoute />);

  expect(screen.getByText('JourneyScreen')).toBeOnTheScreen();
  expect(jest.mocked(JourneyScreen).mock.calls[0][0]).toEqual({
    journey,
    isLoading: false,
    hasError: true,
    onRetry: retry,
  });
});
