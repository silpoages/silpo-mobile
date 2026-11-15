import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ReminderScheduleResult, ReminderTime } from './reminderSettings';

/** Id fixo: reagendar substitui o lembrete anterior em vez de acumular vários. */
const REMINDER_ID = 'silpo-daily-reminder';
const CHANNEL_ID = 'daily-reminder';

export const REMINDER_MESSAGE = 'Como você está se sentindo hoje?';

/** No celular o lembrete é agendado; a versão web (`dailyReminder.web.ts`) não agenda nada. */
export const isDailyReminderSupported = true;

let isHandlerConfigured = false;

/** Sem handler o expo-notifications não mostra notificação com o app aberto. */
export function configureNotificationHandler(): void {
  if (isHandlerConfigured) return;
  isHandlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission(askIfNeeded: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!askIfNeeded || !current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Agenda (ou reagenda) o lembrete diário no horário escolhido.
 * `askPermission: false` é para sincronizações em segundo plano, que não devem abrir o
 * pedido de permissão sem a pessoa ter tocado em nada.
 */
export async function scheduleDailyReminder(
  time: ReminderTime,
  { askPermission }: { askPermission: boolean },
): Promise<ReminderScheduleResult> {
  // No Android 13+ o pedido de permissão só aparece depois que existe um canal.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembrete diário',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  if (!(await ensurePermission(askPermission))) {
    return 'denied';
  }

  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: { title: 'Silpo', body: REMINDER_MESSAGE },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
      channelId: CHANNEL_ID,
    },
  });
  return 'scheduled';
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // Nada agendado: não há o que cancelar.
  }
}
