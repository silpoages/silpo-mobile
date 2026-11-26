import { render, screen } from '@testing-library/react-native';
import { collectPercentWidths } from '@test/journeyAchievementsHelpers';
import { AchievementsProgressCard } from './AchievementsProgressCard';

describe('AchievementsProgressCard', () => {
  it('mostra o progresso e a barra proporcional', async () => {
    const { container } = await render(<AchievementsProgressCard unlocked={1} total={4} />);

    expect(screen.getByText('1 de 4 descobertas')).toBeOnTheScreen();
    expect(screen.getByLabelText('Seu progresso: 1 de 4 descobertas')).toBeOnTheScreen();
    expect(collectPercentWidths(container)).toEqual(['25%']);
  });

  it('com total zero, a barra fica vazia', async () => {
    const { container } = await render(<AchievementsProgressCard unlocked={0} total={0} />);

    expect(screen.getByText('0 de 0 descobertas')).toBeOnTheScreen();
    expect(collectPercentWidths(container)).toEqual(['0%']);
  });

  it('usa singular quando o total é 1', async () => {
    await render(<AchievementsProgressCard unlocked={1} total={1} />);

    expect(screen.getByText('1 de 1 descoberta')).toBeOnTheScreen();
  });
});
