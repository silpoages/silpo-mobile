import { render, screen } from '@testing-library/react-native';
import { collectPercentWidths } from '@test/journeyAchievementsHelpers';
import type { Achievement } from '@/features/achievements/achievementsService';
import { AchievementCard } from './AchievementCard';

function achievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: 'a1',
    name: 'Primeiro passo',
    description: 'Registre uma emoção',
    icon: 'trophy',
    category: 'mood',
    unlocked: true,
    progress: { current: 1, target: 1 },
    unlockedAt: '2026-03-05T12:00:00',
    ...overrides,
  };
}

describe('AchievementCard', () => {
  it('desbloqueada: mostra a data do desbloqueio', async () => {
    const { container } = await render(<AchievementCard achievement={achievement()} />);

    expect(screen.getByText('Primeiro passo')).toBeOnTheScreen();
    expect(screen.getByText('Desbloqueada em 05/03/2026')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Primeiro passo. Registre uma emoção. Desbloqueada em 05/03/2026.'),
    ).toBeOnTheScreen();
    expect(collectPercentWidths(container)).toEqual([]);
  });

  it('desbloqueada sem data: mostra só "Desbloqueada"', async () => {
    await render(<AchievementCard achievement={achievement({ unlockedAt: null })} />);

    expect(screen.getByText('Desbloqueada')).toBeOnTheScreen();
  });

  it('bloqueada: mostra progresso e barra', async () => {
    const { container } = await render(
      <AchievementCard
        achievement={achievement({
          unlocked: false,
          unlockedAt: null,
          progress: { current: 1, target: 4 },
        })}
      />,
    );

    expect(screen.getByText('1 de 4')).toBeOnTheScreen();
    expect(collectPercentWidths(container)).toEqual(['25%']);
  });

  it('bloqueada: limita a barra a 100% e trata meta zero', async () => {
    const { container, rerender } = await render(
      <AchievementCard
        achievement={achievement({ unlocked: false, progress: { current: 8, target: 2 } })}
      />,
    );
    expect(collectPercentWidths(container)).toEqual(['100%']);

    await rerender(
      <AchievementCard
        achievement={achievement({ unlocked: false, progress: { current: 0, target: 0 } })}
      />,
    );
    expect(collectPercentWidths(container)).toEqual(['0%']);
  });
});
