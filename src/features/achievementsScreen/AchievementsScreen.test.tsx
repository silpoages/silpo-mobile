import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';
import type { Achievement } from '@/features/achievements/achievementsService';
import { AchievementsScreen } from './AchievementsScreen';
import { useAchievements } from './useAchievements';

jest.mock('./useAchievements', () => ({ useAchievements: jest.fn() }));

const useAchievementsMock = jest.mocked(useAchievements);
const retry = jest.fn();

function mockState(state: Partial<ReturnType<typeof useAchievements>>) {
  useAchievementsMock.mockReturnValue({
    achievements: null,
    isLoading: false,
    hasError: false,
    retry,
    ...state,
  });
}

function achievement(id: string, unlocked: boolean): Achievement {
  return {
    id,
    name: `Conquista ${id}`,
    description: `Descrição ${id}`,
    icon: 'star',
    category: 'mood',
    unlocked,
    progress: { current: unlocked ? 1 : 0, target: 1 },
    unlockedAt: null,
  };
}

describe('AchievementsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra o título e o carregamento', async () => {
    mockState({ isLoading: true });
    await render(<AchievementsScreen />);

    expect(screen.getByRole('header', { name: 'Minhas conquistas' })).toBeOnTheScreen();
    expect(screen.getByText('Carregando suas conquistas...')).toBeOnTheScreen();
  });

  it('em erro, permite tentar de novo', async () => {
    mockState({ hasError: true });
    await render(<AchievementsScreen />);

    expect(screen.getByText('Não foi possível carregar suas conquistas')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('sem lista (e sem carregamento), mostra o erro', async () => {
    mockState({ achievements: null });
    await render(<AchievementsScreen />);

    expect(screen.getByText('Não foi possível carregar suas conquistas')).toBeOnTheScreen();
  });

  it('com lista vazia, avisa que não há conquistas', async () => {
    mockState({ achievements: [] });
    await render(<AchievementsScreen />);

    expect(screen.getByText('Nenhuma conquista disponível por enquanto')).toBeOnTheScreen();
  });

  it('separa desbloqueadas e por descobrir, com o progresso geral', async () => {
    mockState({
      achievements: [achievement('1', false), achievement('2', true), achievement('3', false)],
    });
    await render(<AchievementsScreen />);

    expect(screen.getByText('1 de 3 descobertas')).toBeOnTheScreen();
    expect(screen.getByText('Desbloqueadas')).toBeOnTheScreen();
    expect(screen.getByText('Por descobrir')).toBeOnTheScreen();
    expect(screen.getByText('Conquista 2')).toBeOnTheScreen();
    expect(screen.getAllByText(/^Conquista [13]$/)).toHaveLength(2);
  });

  it('esconde as seções vazias', async () => {
    mockState({ achievements: [achievement('1', true)] });
    const { rerender } = await render(<AchievementsScreen />);
    expect(screen.queryByText('Por descobrir')).toBeNull();

    mockState({ achievements: [achievement('1', false)] });
    await rerender(<AchievementsScreen />);
    expect(screen.queryByText('Desbloqueadas')).toBeNull();
    expect(screen.getByText('Por descobrir')).toBeOnTheScreen();
  });

  it('voltar usa o histórico quando existe', async () => {
    mockState({ isLoading: true });
    await render(<AchievementsScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('voltar sem histórico vai para a Jornada', async () => {
    mockRouter.canGoBack.mockReturnValue(false);
    mockState({ isLoading: true });
    await render(<AchievementsScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(mockRouter.navigate).toHaveBeenCalledWith('/jornada');
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});
