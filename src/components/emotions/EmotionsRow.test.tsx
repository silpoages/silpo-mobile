import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { getModalHost } from '@test/sharedUiHelpers';
import { EmotionsRow } from '@/components/emotions/EmotionsRow';
import { createMoodLog, getTodayMoodLog } from '@/components/emotions/moodLogService';
import { ApiError } from '@/services/apiClient';

const mockUseSession = jest.fn();
const mockCheckForNewAchievements = jest.fn();

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockUseSession(),
}));
jest.mock('@/features/achievements/AchievementAlertContext', () => ({
  useAchievementAlerts: () => ({ checkForNewAchievements: mockCheckForNewAchievements }),
}));
jest.mock('@/components/emotions/moodLogService', () => ({
  getTodayMoodLog: jest.fn(),
  createMoodLog: jest.fn(),
}));

const mockGetTodayMoodLog = jest.mocked(getTodayMoodLog);
const mockCreateMoodLog = jest.mocked(createMoodLog);

function emotionButton(label: string) {
  return screen.getByRole('button', { name: new RegExp(`${label}$`) });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSession.mockReturnValue({ token: 'tok' });
  mockGetTodayMoodLog.mockResolvedValue(null);
});

describe('EmotionsRow', () => {
  it('sem sessão libera os botões sem consultar a API', async () => {
    mockUseSession.mockReturnValue({ token: null });
    await render(<EmotionsRow />);

    expect(screen.getByText('Como você está se sentindo hoje?')).toBeOnTheScreen();
    await waitFor(() => expect(emotionButton('Feliz')).toBeEnabled());
    expect(mockGetTodayMoodLog).not.toHaveBeenCalled();
  });

  it('sem sessão não envia ao confirmar', async () => {
    mockUseSession.mockReturnValue({ token: null });
    await render(<EmotionsRow />);
    await waitFor(() => expect(emotionButton('Feliz')).toBeEnabled());

    await fireEvent.press(emotionButton('Feliz'));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));

    expect(mockCreateMoodLog).not.toHaveBeenCalled();
    expect(screen.getByText('Confirmar emoção')).toBeOnTheScreen();
  });

  it('marca a emoção já registrada hoje', async () => {
    mockGetTodayMoodLog.mockResolvedValue({ id: 'm1', mood: 'TRISTE', postedAt: 'x' });
    await render(<EmotionsRow />);

    await waitFor(() => expect(emotionButton('Triste')).toBeSelected());
    expect(emotionButton('Feliz')).not.toBeSelected();
  });

  it('ignora falha na consulta de hoje', async () => {
    mockGetTodayMoodLog.mockRejectedValue(new Error('offline'));
    await render(<EmotionsRow />);

    await waitFor(() => expect(emotionButton('Bem')).toBeEnabled());
  });

  it('confirma uma emoção, avisa o pai e verifica conquistas', async () => {
    mockCreateMoodLog.mockResolvedValue({ id: 'm2', mood: 'BEM', postedAt: 'x' });
    const onMoodRegistered = jest.fn();
    await render(<EmotionsRow onMoodRegistered={onMoodRegistered} />);
    await waitFor(() => expect(emotionButton('Bem')).toBeEnabled());

    await fireEvent.press(emotionButton('Bem'));
    expect(screen.getByText('Confirmar emoção')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(screen.queryByText('Confirmar emoção')).not.toBeOnTheScreen());
    expect(mockCreateMoodLog).toHaveBeenCalledWith('tok', 'BEM');
    expect(emotionButton('Bem')).toBeSelected();
    expect(onMoodRegistered).toHaveBeenCalled();
    expect(mockCheckForNewAchievements).toHaveBeenCalled();
  });

  it('cancelar fecha o modal sem registrar', async () => {
    await render(<EmotionsRow />);
    await waitFor(() => expect(emotionButton('Feliz')).toBeEnabled());

    await fireEvent.press(emotionButton('Feliz'));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Confirmar emoção')).not.toBeOnTheScreen();
    expect(mockCreateMoodLog).not.toHaveBeenCalled();
  });

  it('mostra erro genérico quando o registro falha', async () => {
    mockCreateMoodLog.mockRejectedValue(new Error('boom'));
    await render(<EmotionsRow />);
    await waitFor(() => expect(emotionButton('Ansioso')).toBeEnabled());

    await fireEvent.press(emotionButton('Ansioso'));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível registrar agora. Tente novamente.',
    );
    expect(mockGetTodayMoodLog).toHaveBeenCalledTimes(1);
  });

  it('em 409 recarrega o registro de hoje', async () => {
    mockCreateMoodLog.mockRejectedValue(new ApiError(409, 'já existe'));
    await render(<EmotionsRow />);
    await waitFor(() => expect(emotionButton('Irritado')).toBeEnabled());
    mockGetTodayMoodLog.mockResolvedValue({ id: 'm1', mood: 'CANSADO', postedAt: 'x' });

    await fireEvent.press(emotionButton('Irritado'));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
    expect(mockGetTodayMoodLog).toHaveBeenCalledTimes(2);
    expect(emotionButton('Cansado')).toBeSelected();
  });

  it('ignora toques enquanto envia e não fecha o modal', async () => {
    let resolveCreate: (value: { id: string; mood: 'FELIZ'; postedAt: string }) => void = () => {};
    mockCreateMoodLog.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );
    await render(<EmotionsRow />);
    await waitFor(() => expect(emotionButton('Feliz')).toBeEnabled());

    await fireEvent.press(emotionButton('Feliz'));
    // O handler só termina quando o envio resolver, então o toque não é aguardado aqui.
    const confirmPress = fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(emotionButton('Bem')).toBeDisabled());
    // Durante o envio, nem o backdrop/cancelar nem outra emoção fecham ou trocam o modal.
    await fireEvent(getModalHost(), 'requestClose');
    await fireEvent.press(emotionButton('Bem'));
    expect(screen.getByText('Confirmar emoção')).toBeOnTheScreen();

    await act(async () => {
      resolveCreate({ id: 'm', mood: 'FELIZ', postedAt: 'x' });
    });
    await confirmPress;
    await waitFor(() => expect(emotionButton('Feliz')).toBeSelected());
  });
});
