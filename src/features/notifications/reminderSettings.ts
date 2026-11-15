import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReminderTime = {
  hour: number;
  minute: number;
};

/**
 * `scheduled`: lembrete agendado. `denied`: sem permissão de notificação no aparelho.
 * `unsupported`: plataforma sem notificação agendada (web).
 */
export type ReminderScheduleResult = 'scheduled' | 'denied' | 'unsupported';

export const DEFAULT_REMINDER_TIME: ReminderTime = { hour: 20, minute: 0 };

/** O horário fica só no aparelho: é onde a notificação é agendada. */
const REMINDER_TIME_STORAGE_KEY = 'silpo.dailyReminder.time';

function isValidTime(value: unknown): value is ReminderTime {
  if (typeof value !== 'object' || value === null) return false;
  const { hour, minute } = value as Record<string, unknown>;
  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    (hour as number) >= 0 &&
    (hour as number) <= 23 &&
    (minute as number) >= 0 &&
    (minute as number) <= 59
  );
}

export async function getReminderTime(): Promise<ReminderTime> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_TIME_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isValidTime(parsed) ? parsed : DEFAULT_REMINDER_TIME;
  } catch {
    return DEFAULT_REMINDER_TIME;
  }
}

export async function saveReminderTime(time: ReminderTime): Promise<void> {
  await AsyncStorage.setItem(REMINDER_TIME_STORAGE_KEY, JSON.stringify(time));
}

export function formatReminderTime({ hour, minute }: ReminderTime): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
