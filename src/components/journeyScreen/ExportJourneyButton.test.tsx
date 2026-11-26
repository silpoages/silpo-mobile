import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { getAchievements, type Achievement } from '@/features/achievements/achievementsService';
import { exportJourneyReport } from '@/features/journeyScreen/journeyReportExport';
import type { JourneyData } from '@/features/journeyScreen/journeyService';
import { ExportJourneyButton } from './ExportJourneyButton';

const mockSession: { token: string | null } = { token: 'tok' };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));
jest.mock('@/features/achievements/achievementsService', () => ({
  getAchievements: jest.fn(),
}));
jest.mock('@/features/journeyScreen/journeyReportExport', () => ({
  exportJourneyReport: jest.fn(),
}));

const getAchievementsMock = jest.mocked(getAchievements);
const exportJourneyReportMock = jest.mocked(exportJourneyReport);

const journey: JourneyData = {
  daysRegistered: 1,
  practicesTried: 0,
  exercisesCompleted: 0,
  moodCounts: { BEM: 1 },
  achievements: { unlocked: 0, total: 3 },
};
const achievementList: Achievement[] = [];

const LABEL = 'Exportar Minha Jornada (PDF)';
const ERROR = 'Não foi possível gerar o PDF. Tente de novo.';

describe('ExportJourneyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.token = 'tok';
    getAchievementsMock.mockResolvedValue(achievementList);
    exportJourneyReportMock.mockResolvedValue(undefined);
  });

  it('busca as conquistas na hora e gera o PDF', async () => {
    await render(<ExportJourneyButton journey={journey} userName="Ana" />);

    await fireEvent.press(screen.getByText(LABEL));

    await waitFor(() =>
      expect(exportJourneyReportMock).toHaveBeenCalledWith(journey, achievementList, 'Ana'),
    );
    expect(getAchievementsMock).toHaveBeenCalledWith('tok');
    expect(await screen.findByText(LABEL)).toBeOnTheScreen();
    expect(screen.queryByText(ERROR)).toBeNull();
  });

  it('mostra erro quando a geração falha', async () => {
    exportJourneyReportMock.mockRejectedValue(new Error('falhou'));
    await render(<ExportJourneyButton journey={journey} userName="Ana" />);

    await fireEvent.press(screen.getByText(LABEL));

    expect(await screen.findByText(ERROR)).toBeOnTheScreen();
  });

  it('mostra erro sem chamar a API quando não há sessão', async () => {
    mockSession.token = null;
    await render(<ExportJourneyButton journey={journey} userName="Ana" />);

    await fireEvent.press(screen.getByText(LABEL));

    expect(await screen.findByText(ERROR)).toBeOnTheScreen();
    expect(getAchievementsMock).not.toHaveBeenCalled();
    expect(exportJourneyReportMock).not.toHaveBeenCalled();
  });

  it('limpa o erro ao tentar de novo com sucesso', async () => {
    getAchievementsMock.mockRejectedValueOnce(new Error('rede'));
    await render(<ExportJourneyButton journey={journey} userName="Ana" />);

    await fireEvent.press(screen.getByText(LABEL));
    expect(await screen.findByText(ERROR)).toBeOnTheScreen();

    await fireEvent.press(screen.getByText(LABEL));
    await waitFor(() => expect(screen.queryByText(ERROR)).toBeNull());
    expect(exportJourneyReportMock).toHaveBeenCalledTimes(1);
  });
});
