import type { ReminderScheduleResult, ReminderTime } from './reminderSettings';

export const REMINDER_MESSAGE = 'Como você está se sentindo hoje?';

/**
 * Web: o navegador não entrega notificação agendada com a página fechada, então o
 * lembrete só é enviado pelo app no celular. A preferência continua salva na conta.
 */
export const isDailyReminderSupported = false;

export function configureNotificationHandler(): void {}

export async function scheduleDailyReminder(
  _time: ReminderTime,
  _options: { askPermission: boolean },
): Promise<ReminderScheduleResult> {
  return 'unsupported';
}

export async function cancelDailyReminder(): Promise<void> {}
