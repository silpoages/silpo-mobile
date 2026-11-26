import {
  cancelDailyReminder,
  configureNotificationHandler,
  isDailyReminderSupported,
  REMINDER_MESSAGE,
  scheduleDailyReminder,
} from '@/features/notifications/dailyReminder.web';

describe('dailyReminder (web)', () => {
  it('não suporta agendamento no navegador', async () => {
    expect(isDailyReminderSupported).toBe(false);
    expect(REMINDER_MESSAGE).toBe('Como você está se sentindo hoje?');
    expect(configureNotificationHandler()).toBeUndefined();
    await expect(
      scheduleDailyReminder({ hour: 8, minute: 0 }, { askPermission: true }),
    ).resolves.toBe('unsupported');
    await expect(cancelDailyReminder()).resolves.toBeUndefined();
  });
});
