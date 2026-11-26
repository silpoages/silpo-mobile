import { render, screen } from '@testing-library/react-native';
import { collectPercentWidths } from '@test/journeyAchievementsHelpers';
import { MoodDistributionRow } from './MoodDistributionRow';

describe('MoodDistributionRow', () => {
  it('mostra rótulo, contagem e barra proporcional à maior contagem', async () => {
    const { container } = await render(
      <MoodDistributionRow iconName="emoticon-outline" label="Bem" count={2} maxCount={4} />,
    );

    expect(screen.getByText('Bem')).toBeOnTheScreen();
    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(screen.getByLabelText('Bem: 2 dias')).toBeOnTheScreen();
    expect(collectPercentWidths(container)).toEqual(['50%']);
  });

  it('usa singular e barra vazia quando não há máximo', async () => {
    const { container } = await render(
      <MoodDistributionRow iconName="emoticon-outline" label="Bem" count={1} maxCount={0} />,
    );

    expect(screen.getByLabelText('Bem: 1 dia')).toBeOnTheScreen();
    expect(collectPercentWidths(container)).toEqual(['0%']);
  });
});
