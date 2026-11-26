import { renderHook, waitFor } from '@testing-library/react-native';

import { useSession } from '@/features/auth/session/SessionContext';
import {
  cancelDailyReminder,
  configureNotificationHandler,
  scheduleDailyReminder,
} from '@/features/notifications/dailyReminder';
import { getReminderTime } from '@/features/notifications/reminderSettings';
import { useDailyReminderSync } from '@/features/notifications/useDailyReminderSync';
import { getUserPreferences } from '@/services/user';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/services/user', () => ({ getUserPreferences: jest.fn() }));
jest.mock('@/features/notifications/reminderSettings', () => ({ getReminderTime: jest.fn() }));
jest.mock('@/features/notifications/dailyReminder', () => ({
  isDailyReminderSupported: true,
  configureNotificationHandler: jest.fn(),
  scheduleDailyReminder: jest.fn(),
  cancelDailyReminder: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);
const mockGetUserPreferences = jest.mocked(getUserPreferences);
const mockGetReminderTime = jest.mocked(getReminderTime);
const mockSchedule = jest.mocked(scheduleDailyReminder);
const mockCancel = jest.mocked(cancelDailyReminder);

function setSession(token: string | null, onboardingCompleted: boolean | null) {
  mockUseSession.mockReturnValue({
    token,
    user:
      onboardingCompleted === null
        ? null
        : { id: 'u1', email: 'a@b.com', fullName: 'Ana', role: 'USER', onboardingCompleted },
    isAuthenticated: token !== null,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetReminderTime.mockResolvedValue({ hour: 8, minute: 0 });
  mockSchedule.mockResolvedValue('scheduled');
  mockCancel.mockResolvedValue();
});

describe('useDailyReminderSync', () => {
  it('configura o handler e não sincroniza sem sessão', async () => {
    setSession(null, null);
    await renderHook(() => useDailyReminderSync());

    expect(configureNotificationHandler).toHaveBeenCalled();
    expect(mockGetUserPreferences).not.toHaveBeenCalled();
  });

  it('não sincroniza enquanto o onboarding está pendente', async () => {
    setSession('tok', false);
    await renderHook(() => useDailyReminderSync());
    expect(mockGetUserPreferences).not.toHaveBeenCalled();
  });

  it('agenda sem pedir permissão quando a conta tem o lembrete ativo', async () => {
    setSession('tok', true);
    mockGetUserPreferences.mockResolvedValue({ dailyReminderEnabled: true });

    await renderHook(() => useDailyReminderSync());

    await waitFor(() =>
      expect(mockSchedule).toHaveBeenCalledWith({ hour: 8, minute: 0 }, { askPermission: false }),
    );
    expect(mockGetUserPreferences).toHaveBeenCalledWith('tok');
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('cancela quando a conta desativou o lembrete', async () => {
    setSession('tok', true);
    mockGetUserPreferences.mockResolvedValue({ dailyReminderEnabled: false });

    await renderHook(() => useDailyReminderSync());

    await waitFor(() => expect(mockCancel).toHaveBeenCalled());
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('mantém o agendamento atual quando a rede falha', async () => {
    setSession('tok', true);
    mockGetUserPreferences.mockRejectedValue(new Error('offline'));

    await renderHook(() => useDailyReminderSync());

    await waitFor(() => expect(mockGetUserPreferences).toHaveBeenCalled());
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('ignora a resposta quando desmontado antes dela chegar', async () => {
    setSession('tok', true);
    let resolvePreferences!: (value: { dailyReminderEnabled: boolean }) => void;
    mockGetUserPreferences.mockReturnValue(
      new Promise((resolve) => {
        resolvePreferences = resolve;
      }),
    );

    const { unmount } = await renderHook(() => useDailyReminderSync());
    await unmount();
    resolvePreferences({ dailyReminderEnabled: true });
    await Promise.resolve();
    await Promise.resolve();

    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockCancel).not.toHaveBeenCalled();
  });
});
