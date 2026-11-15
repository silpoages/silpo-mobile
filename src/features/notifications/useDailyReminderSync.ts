import { useEffect } from 'react';
import { useSession } from '@/features/auth/session/SessionContext';
import { getUserPreferences } from '@/services/user';
import {
  cancelDailyReminder,
  configureNotificationHandler,
  isDailyReminderSupported,
  scheduleDailyReminder,
} from './dailyReminder';
import { getReminderTime } from './reminderSettings';

/**
 * Deixa o agendamento do aparelho igual à preferência da conta ao abrir o app ou entrar:
 * cobre login em outro aparelho e quem ativou o lembrete antes de ele existir de fato.
 * Não pede permissão — só agenda se ela já foi dada.
 */
export function useDailyReminderSync(): void {
  const { token, user } = useSession();
  const onboardingCompleted = user?.onboardingCompleted ?? false;

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  useEffect(() => {
    if (!isDailyReminderSupported || !token || !onboardingCompleted) return;

    let cancelled = false;
    (async () => {
      try {
        const { dailyReminderEnabled } = await getUserPreferences(token);
        if (cancelled) return;
        if (dailyReminderEnabled) {
          await scheduleDailyReminder(await getReminderTime(), { askPermission: false });
        } else {
          await cancelDailyReminder();
        }
      } catch {
        // Sem rede: fica o que já estava agendado.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, onboardingCompleted]);
}
