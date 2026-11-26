import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { mockRouter } from '@test/mocks/expoRouter';
import { makeSession } from '@test/onboardingTestUtils';

import { useSession } from '@/features/auth/session/SessionContext';
import { cancelDailyReminder, scheduleDailyReminder } from '@/features/notifications/dailyReminder';
import { getReminderTime, saveReminderTime } from '@/features/notifications/reminderSettings';
import { NotificationsScreen } from '@/features/notificationsScreen/NotificationsScreen';
import { getUserPreferences, updateUserPreferences } from '@/services/user';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/services/user', () => ({
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
}));
jest.mock('@/features/notifications/dailyReminder', () => ({
  isDailyReminderSupported: true,
  REMINDER_MESSAGE: 'Como você está se sentindo hoje?',
  scheduleDailyReminder: jest.fn(),
  cancelDailyReminder: jest.fn(),
}));
jest.mock('@/features/notifications/reminderSettings', () => ({
  ...jest.requireActual('@/features/notifications/reminderSettings'),
  getReminderTime: jest.fn(),
  saveReminderTime: jest.fn(),
}));
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View testID="time-picker" {...props} />,
  };
});

const mockUseSession = jest.mocked(useSession);
const mockGetPreferences = jest.mocked(getUserPreferences);
const mockUpdatePreferences = jest.mocked(updateUserPreferences);
const mockSchedule = jest.mocked(scheduleDailyReminder);
const mockCancel = jest.mocked(cancelDailyReminder);
const mockGetReminderTime = jest.mocked(getReminderTime);
const mockSaveReminderTime = jest.mocked(saveReminderTime);

function getSwitch() {
  return screen.getByLabelText('Lembrete diário');
}

async function renderLoaded(enabled: boolean) {
  mockGetPreferences.mockResolvedValue({ dailyReminderEnabled: enabled });
  await render(<NotificationsScreen />);
  await screen.findByLabelText('Lembrete diário');
}

function at(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function pickTime(hour: number, minute: number) {
  await fireEvent.press(screen.getByRole('button', { name: /Horário do lembrete/ }));
  await fireEvent(screen.getByTestId('time-picker'), 'change', { type: 'set' }, at(hour, minute));
  await fireEvent.press(screen.getByText('Confirmar'));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSession.mockReturnValue(makeSession());
  mockGetReminderTime.mockResolvedValue({ hour: 21, minute: 30 });
  mockSaveReminderTime.mockResolvedValue();
  mockSchedule.mockResolvedValue('scheduled');
  mockCancel.mockResolvedValue();
  mockUpdatePreferences.mockImplementation(async (_token, input) => input);
});

describe('NotificationsScreen', () => {
  it('fica carregando enquanto não há sessão', async () => {
    mockUseSession.mockReturnValue(makeSession({ token: null, user: null }));
    await render(<NotificationsScreen />);

    expect(screen.getByRole('header', { name: 'Notificações' })).toBeTruthy();
    expect(screen.queryByLabelText('Lembrete diário')).toBeNull();
    expect(mockGetPreferences).not.toHaveBeenCalled();
  });

  it('carrega a preferência e o horário salvos', async () => {
    await renderLoaded(true);

    expect(getSwitch()).toBeChecked();
    expect(screen.getByText('21:30')).toBeTruthy();
    expect(screen.getByText('"Como você está se sentindo hoje?"')).toBeTruthy();
    expect(mockGetPreferences).toHaveBeenCalledWith('token-123');
  });

  it('esconde o horário com o lembrete desligado', async () => {
    await renderLoaded(false);

    expect(getSwitch()).not.toBeChecked();
    expect(screen.queryByText('Horário')).toBeNull();
  });

  it('mostra erro de carregamento e tenta de novo', async () => {
    mockGetPreferences.mockRejectedValueOnce(new Error('offline'));
    await render(<NotificationsScreen />);

    expect(await screen.findByText('Não foi possível carregar suas notificações.')).toBeTruthy();

    mockGetPreferences.mockResolvedValueOnce({ dailyReminderEnabled: true });
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByLabelText('Lembrete diário')).toBeChecked();
    expect(mockGetPreferences).toHaveBeenCalledTimes(2);
  });

  it('ignora respostas que chegam depois de sair da tela', async () => {
    let resolvePreferences!: (value: { dailyReminderEnabled: boolean }) => void;
    let rejectSecond!: (error: Error) => void;
    mockGetPreferences
      .mockReturnValueOnce(new Promise((resolve) => (resolvePreferences = resolve)))
      .mockReturnValueOnce(new Promise((_resolve, reject) => (rejectSecond = reject)));

    const first = await render(<NotificationsScreen />);
    await first.unmount();
    await act(async () => resolvePreferences({ dailyReminderEnabled: true }));

    const second = await render(<NotificationsScreen />);
    await second.unmount();
    await act(async () => rejectSecond(new Error('offline')));

    expect(mockGetPreferences).toHaveBeenCalledTimes(2);
  });

  it('volta pela pilha ou vai para o perfil', async () => {
    await renderLoaded(false);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalled();

    mockRouter.canGoBack.mockReturnValue(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/perfil');
  });

  it('ativar salva a preferência e agenda pedindo permissão', async () => {
    await renderLoaded(false);

    await fireEvent(getSwitch(), 'valueChange', true);

    await waitFor(() =>
      expect(mockSchedule).toHaveBeenCalledWith({ hour: 21, minute: 30 }, { askPermission: true }),
    );
    expect(mockUpdatePreferences).toHaveBeenCalledWith('token-123', {
      dailyReminderEnabled: true,
    });
    expect(getSwitch()).toBeChecked();
    expect(screen.queryByText(/As notificações do Silpo estão desativadas/)).toBeNull();
  });

  it('avisa e abre as configurações quando a permissão é negada', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    mockSchedule.mockResolvedValue('denied');
    await renderLoaded(false);

    await fireEvent(getSwitch(), 'valueChange', true);

    expect(await screen.findByText(/As notificações do Silpo estão desativadas/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir configurações' }));
    expect(openSettings).toHaveBeenCalled();

    // Desligar cancela o agendamento e some com o aviso.
    await fireEvent(getSwitch(), 'valueChange', false);
    await waitFor(() => expect(mockCancel).toHaveBeenCalled());
    expect(screen.queryByText(/As notificações do Silpo estão desativadas/)).toBeNull();
  });

  it('desfaz o switch e mostra erro quando salvar falha', async () => {
    mockUpdatePreferences.mockRejectedValueOnce(new Error('offline'));
    await renderLoaded(true);

    await fireEvent(getSwitch(), 'valueChange', false);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar agora. Tente novamente.',
    );
    expect(getSwitch()).toBeChecked();
    expect(mockCancel).not.toHaveBeenCalled();
    expect(getSwitch().props.disabled).toBe(false);
  });

  it('não mostra erro se o agendamento falhar depois de salvar', async () => {
    mockSchedule.mockRejectedValueOnce(new Error('nativo'));
    await renderLoaded(false);

    await fireEvent(getSwitch(), 'valueChange', true);

    await waitFor(() => expect(mockSchedule).toHaveBeenCalled());
    await waitFor(() => expect(getSwitch().props.disabled).toBe(false));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(getSwitch()).toBeChecked();
  });

  it('ignora toques repetidos enquanto salva', async () => {
    let resolveUpdate!: () => void;
    mockUpdatePreferences.mockReturnValueOnce(
      new Promise((resolve) => (resolveUpdate = () => resolve({ dailyReminderEnabled: true }))),
    );
    await renderLoaded(false);

    const toggling = fireEvent(getSwitch(), 'valueChange', true);
    await waitFor(() => expect(getSwitch().props.disabled).toBe(true));

    // O Switch desabilitado não dispara; chamamos o handler do host direto para cobrir a trava.
    await act(async () => {
      getSwitch().props.onChange({ nativeEvent: { value: false } });
    });

    await act(async () => {
      resolveUpdate();
      await toggling;
    });
    await waitFor(() => expect(getSwitch().props.disabled).toBe(false));
    expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
  });

  it('salva o novo horário e reagenda quando o lembrete está ativo', async () => {
    await renderLoaded(true);

    await pickTime(7, 15);

    await waitFor(() =>
      expect(mockSchedule).toHaveBeenCalledWith({ hour: 7, minute: 15 }, { askPermission: true }),
    );
    expect(mockSaveReminderTime).toHaveBeenCalledWith({ hour: 7, minute: 15 });
    expect(screen.getByText('07:15')).toBeTruthy();
  });

  it('mostra erro quando não consegue salvar o horário', async () => {
    mockSaveReminderTime.mockRejectedValueOnce(new Error('storage'));
    await renderLoaded(true);

    await pickTime(6, 0);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar agora. Tente novamente.',
    );
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
