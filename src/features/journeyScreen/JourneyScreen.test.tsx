import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';
import { JourneyScreen } from './JourneyScreen';
import type { JourneyData } from './journeyService';

const mockSession: {
  token: string | null;
  user: { fullName: string | null; email: string } | null;
} = { token: 'tok', user: { fullName: 'Ana Souza', email: 'ana@exemplo.com' } };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));
jest.mock('@/components/journeyScreen/ExportJourneyButton', () => {
  const { Text } = require('react-native');
  return {
    ExportJourneyButton: ({ userName }: { userName: string }) => (
      <Text>{`Exportar PDF de ${userName}`}</Text>
    ),
  };
});

function journey(overrides: Partial<JourneyData> = {}): JourneyData {
  return {
    daysRegistered: 3,
    practicesTried: 1,
    exercisesCompleted: 2,
    moodCounts: { FELIZ: 2, BEM: 1 },
    achievements: { unlocked: 1, total: 5 },
    ...overrides,
  };
}

const EMPTY_JOURNEY = journey({
  daysRegistered: 0,
  practicesTried: 0,
  exercisesCompleted: 0,
  achievements: { unlocked: 0, total: 5 },
});

describe('JourneyScreen', () => {
  beforeEach(() => {
    mockSession.user = { fullName: 'Ana Souza', email: 'ana@exemplo.com' };
  });

  it('mostra o carregamento sem botão de exportar', async () => {
    await render(<JourneyScreen isLoading journey={journey()} />);

    expect(screen.getByText('Minha jornada')).toBeOnTheScreen();
    expect(screen.getByText('Carregando sua jornada...')).toBeOnTheScreen();
    expect(screen.queryByText(/Exportar PDF/)).toBeNull();
  });

  it('em erro, mostra a mensagem e o botão de tentar de novo', async () => {
    const onRetry = jest.fn();
    await render(<JourneyScreen hasError onRetry={onRetry} />);

    expect(screen.getByText('Não foi possível carregar sua jornada')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('em erro sem onRetry, não mostra o botão', async () => {
    await render(<JourneyScreen hasError />);

    expect(screen.queryByText('Tentar de novo')).toBeNull();
  });

  it('sem dados, mostra o estado vazio e não exporta', async () => {
    await render(<JourneyScreen />);

    expect(screen.getByText('Sua jornada começa aqui')).toBeOnTheScreen();
    expect(screen.queryByText(/Exportar PDF/)).toBeNull();
  });

  it('com tudo zerado, mostra o estado vazio mas ainda permite exportar', async () => {
    await render(<JourneyScreen journey={EMPTY_JOURNEY} />);

    expect(screen.getByText('Sua jornada começa aqui')).toBeOnTheScreen();
    expect(screen.getByText('Exportar PDF de Ana Souza')).toBeOnTheScreen();
  });

  it('mostra o resumo, as métricas, as emoções e as conquistas', async () => {
    await render(<JourneyScreen journey={journey()} />);

    expect(
      screen.getByText('Você registrou como estava se sentindo em 3 dias este mês.'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('1 prática diferente experimentada')).toBeOnTheScreen();
    expect(screen.getByLabelText('2 exercícios concluídos')).toBeOnTheScreen();
    expect(screen.getByLabelText('Feliz: 2 dias')).toBeOnTheScreen();
    expect(screen.getByText('1 de 5 descobertas')).toBeOnTheScreen();
  });

  it('usa os plurais das métricas', async () => {
    await render(<JourneyScreen journey={journey({ practicesTried: 2, exercisesCompleted: 1 })} />);

    expect(screen.getByLabelText('2 práticas diferentes experimentadas')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 exercício concluído')).toBeOnTheScreen();
  });

  it('abre a tela de conquistas e o perfil', async () => {
    await render(<JourneyScreen journey={journey()} />);

    await fireEvent.press(screen.getByRole('button', { name: /^Minhas conquistas/ }));
    expect(mockRouter.push).toHaveBeenCalledWith('/conquistas');

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/perfil');
    expect(screen.getByText('A')).toBeOnTheScreen();
  });

  it('sem nome, usa o e-mail; sem usuário, fica sem nome', async () => {
    mockSession.user = { fullName: '   ', email: 'bia@exemplo.com' };
    const { rerender } = await render(<JourneyScreen journey={journey()} />);
    expect(screen.getByText('Exportar PDF de bia@exemplo.com')).toBeOnTheScreen();

    mockSession.user = { fullName: null, email: 'caio@exemplo.com' };
    await rerender(<JourneyScreen journey={journey()} />);
    expect(screen.getByText('Exportar PDF de caio@exemplo.com')).toBeOnTheScreen();

    mockSession.user = null;
    await rerender(<JourneyScreen journey={journey()} />);
    expect(screen.getByText('Exportar PDF de')).toBeOnTheScreen();
  });
});
