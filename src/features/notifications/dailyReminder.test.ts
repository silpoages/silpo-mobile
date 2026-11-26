import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

const mocked = Notifications as jest.Mocked<typeof Notifications>;

type DailyReminderModule = typeof import('@/features/notifications/dailyReminder');

function loadModule(): DailyReminderModule {
  let mod!: DailyReminderModule;
  jest.isolateModules(() => {
    mod = require('@/features/notifications/dailyReminder');
  });
  return mod;
}

function permission(granted: boolean, canAskAgain = true) {
  return { granted, canAskAgain } as unknown as Notifications.NotificationPermissionsStatus;
}

const originalOS = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
});

describe('configureNotificationHandler', () => {
  it('registra o handler uma única vez, mostrando banner sem som', async () => {
    const { configureNotificationHandler, isDailyReminderSupported } = loadModule();
    expect(isDailyReminderSupported).toBe(true);

    configureNotificationHandler();
    configureNotificationHandler();

    expect(mocked.setNotificationHandler).toHaveBeenCalledTimes(1);
    const handler = mocked.setNotificationHandler.mock.calls[0][0];
    await expect(handler?.handleNotification({} as Notifications.Notification)).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });
});

describe('scheduleDailyReminder', () => {
  it('agenda com permissão já concedida, cancelando o anterior', async () => {
    const { scheduleDailyReminder, REMINDER_MESSAGE } = loadModule();
    mocked.getPermissionsAsync.mockResolvedValue(permission(true));

    await expect(
      scheduleDailyReminder({ hour: 9, minute: 15 }, { askPermission: false }),
    ).resolves.toBe('scheduled');

    expect(mocked.setNotificationChannelAsync).not.toHaveBeenCalled();
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith('silpo-daily-reminder');
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: 'silpo-daily-reminder',
      content: { title: 'Silpo', body: REMINDER_MESSAGE },
      trigger: { type: 'daily', hour: 9, minute: 15, channelId: 'daily-reminder' },
    });
  });

  it('cria o canal no Android antes de checar a permissão', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    const { scheduleDailyReminder } = loadModule();
    mocked.getPermissionsAsync.mockResolvedValue(permission(true));

    await scheduleDailyReminder({ hour: 20, minute: 0 }, { askPermission: false });

    expect(mocked.setNotificationChannelAsync).toHaveBeenCalledWith('daily-reminder', {
      name: 'Lembrete diário',
      importance: 3,
    });
  });

  it('retorna denied sem pedir permissão em sincronização silenciosa', async () => {
    const { scheduleDailyReminder } = loadModule();
    mocked.getPermissionsAsync.mockResolvedValue(permission(false));

    await expect(
      scheduleDailyReminder({ hour: 20, minute: 0 }, { askPermission: false }),
    ).resolves.toBe('denied');
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('retorna denied quando o sistema não deixa pedir de novo', async () => {
    const { scheduleDailyReminder } = loadModule();
    mocked.getPermissionsAsync.mockResolvedValue(permission(false, false));

    await expect(
      scheduleDailyReminder({ hour: 20, minute: 0 }, { askPermission: true }),
    ).resolves.toBe('denied');
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('pede permissão e agenda quando concedida', async () => {
    const { scheduleDailyReminder } = loadModule();
    mocked.getPermissionsAsync.mockResolvedValue(permission(false));
    mocked.requestPermissionsAsync.mockResolvedValue(permission(true));

    await expect(
      scheduleDailyReminder({ hour: 20, minute: 0 }, { askPermission: true }),
    ).resolves.toBe('scheduled');
    expect(mocked.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('retorna denied quando a pessoa recusa o pedido', async () => {
    const { scheduleDailyReminder } = loadModule();
    mocked.getPermissionsAsync.mockResolvedValue(permission(false));
    mocked.requestPermissionsAsync.mockResolvedValue(permission(false));

    await expect(
      scheduleDailyReminder({ hour: 20, minute: 0 }, { askPermission: true }),
    ).resolves.toBe('denied');
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('cancelDailyReminder', () => {
  it('cancela o lembrete pelo id fixo', async () => {
    const { cancelDailyReminder } = loadModule();
    await cancelDailyReminder();
    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith('silpo-daily-reminder');
  });

  it('ignora erro quando não há nada agendado', async () => {
    const { cancelDailyReminder } = loadModule();
    mocked.cancelScheduledNotificationAsync.mockRejectedValueOnce(new Error('nada'));
    await expect(cancelDailyReminder()).resolves.toBeUndefined();
  });
});
