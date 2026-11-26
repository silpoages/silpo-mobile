import { act, render, screen } from '@testing-library/react-native';
import { getAchievements, type Achievement } from '@/features/achievements/achievementsService';
import { exportJourneyReport } from '@/features/journeyScreen/journeyReportExport';
import type { JourneyData } from '@/features/journeyScreen/journeyService';
import { ExportJourneyButton } from './ExportJourneyButton';

/**
 * `Button` simplificado: expõe o `onPress` mais recente e mostra o estado de carregamento.
 * Assim dá para acionar o handler enquanto uma exportação ainda está pendente — o `Button`
 * real fica desabilitado nesse meio-tempo, mas o handler tem a própria trava contra toque duplo.
 */
const mockButton: { onPress: (() => Promise<void>) | null } = { onPress: null };

jest.mock('@/components/Button', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({
      children,
      loading,
      onPress,
    }: {
      children: string;
      loading: boolean;
      onPress: () => Promise<void>;
    }) => {
      mockButton.onPress = onPress;
      return <Text>{loading ? 'Carregando' : children}</Text>;
    },
  };
});
jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => ({ token: 'tok' }),
}));
jest.mock('@/features/achievements/achievementsService', () => ({
  getAchievements: jest.fn(),
}));
jest.mock('@/features/journeyScreen/journeyReportExport', () => ({
  exportJourneyReport: jest.fn(),
}));

const journey: JourneyData = {
  daysRegistered: 1,
  practicesTried: 0,
  exercisesCompleted: 0,
  moodCounts: {},
  achievements: { unlocked: 0, total: 1 },
};

it('mostra carregando e ignora novos toques enquanto a exportação está em andamento', async () => {
  let finish!: () => void;
  jest.mocked(getAchievements).mockReturnValue(
    new Promise<Achievement[]>((resolve) => {
      finish = () => resolve([]);
    }),
  );
  jest.mocked(exportJourneyReport).mockResolvedValue(undefined);
  await render(<ExportJourneyButton journey={journey} userName="Ana" />);

  let firstExport!: Promise<void>;
  await act(async () => {
    firstExport = mockButton.onPress!();
  });
  expect(screen.getByText('Carregando')).toBeOnTheScreen();

  // Handler do render já em carregamento: retorna sem buscar de novo.
  await act(() => mockButton.onPress!());
  expect(getAchievements).toHaveBeenCalledTimes(1);

  await act(async () => {
    finish();
    await firstExport;
  });

  expect(screen.getByText('Exportar Minha Jornada (PDF)')).toBeOnTheScreen();
  expect(exportJourneyReport).toHaveBeenCalledTimes(1);
});
