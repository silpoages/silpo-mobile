import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { BackButton } from '@/components/BackButton';
import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ReminderTimeField } from '@/components/notificationsScreen/ReminderTimeField';
import { useSession } from '@/features/auth/session/SessionContext';
import {
  cancelDailyReminder,
  isDailyReminderSupported,
  REMINDER_MESSAGE,
  scheduleDailyReminder,
} from '@/features/notifications/dailyReminder';
import {
  DEFAULT_REMINDER_TIME,
  getReminderTime,
  saveReminderTime,
  type ReminderTime,
} from '@/features/notifications/reminderSettings';
import { getUserPreferences, updateUserPreferences } from '@/services/user';
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

const LOAD_ERROR_MESSAGE = 'Não foi possível carregar suas notificações.';
const SAVE_ERROR_MESSAGE = 'Não foi possível salvar agora. Tente novamente.';

export function NotificationsScreen() {
  const router = useRouter();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState<ReminderTime>(DEFAULT_REMINDER_TIME);
  const [isSaving, setIsSaving] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const isSavingRef = useRef(false);

  const token = session.token;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    Promise.all([getUserPreferences(token), getReminderTime()])
      .then(([preferences, savedTime]) => {
        if (cancelled) return;
        setEnabled(preferences.dailyReminderEnabled);
        setTime(savedTime);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/perfil');
    }
  }

  function handleRetry() {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }

  async function applySchedule(nextEnabled: boolean, nextTime: ReminderTime) {
    if (!nextEnabled) {
      await cancelDailyReminder();
      setIsPermissionDenied(false);
      return;
    }
    const result = await scheduleDailyReminder(nextTime, { askPermission: true });
    setIsPermissionDenied(result === 'denied');
  }

  async function handleToggle(nextEnabled: boolean) {
    if (!token || isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setErrorMessage(null);
    setEnabled(nextEnabled);

    try {
      await updateUserPreferences(token, { dailyReminderEnabled: nextEnabled });
    } catch {
      setEnabled(!nextEnabled);
      setErrorMessage(SAVE_ERROR_MESSAGE);
      isSavingRef.current = false;
      setIsSaving(false);
      return;
    }

    try {
      await applySchedule(nextEnabled, time);
    } catch {
      // A preferência já foi salva; a sincronização ao abrir o app tenta agendar de novo.
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  async function handleTimeChange(nextTime: ReminderTime) {
    setTime(nextTime);
    setErrorMessage(null);
    try {
      await saveReminderTime(nextTime);
      if (enabled) {
        await applySchedule(true, nextTime);
      }
    } catch {
      setErrorMessage(SAVE_ERROR_MESSAGE);
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <StatusBar style="dark" />

      <View>
        <BackButton onPress={handleBack} />
        <View style={styles.titleContainer}>
          <Text accessibilityRole="header" style={styles.title}>
            Notificações
          </Text>
          <Text style={styles.subtitle}>
            No máximo um lembrete gentil por dia. Nada de cobranças.
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerFeedback}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : loadFailed ? (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>{LOAD_ERROR_MESSAGE}</Text>
          <Text style={styles.feedbackSubtitle}>Verifique sua conexão e tente de novo.</Text>
          <Button variant="secondary" onPress={handleRetry}>
            Tentar novamente
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Lembrete diário</Text>
                <Text style={styles.cardSubtitle}>&quot;{REMINDER_MESSAGE}&quot;</Text>
              </View>
              <Switch
                accessibilityLabel="Lembrete diário"
                disabled={isSaving}
                onValueChange={handleToggle}
                thumbColor={Platform.OS === 'android' && enabled ? colors.surface : undefined}
                trackColor={{ false: colors.border, true: colors.primary }}
                value={enabled}
              />
            </View>

            {enabled ? (
              <>
                <View style={styles.divider} />
                <ReminderTimeField disabled={isSaving} onChange={handleTimeChange} value={time} />
              </>
            ) : null}
          </View>

          {enabled && !isDailyReminderSupported ? (
            <Text style={styles.note}>
              No navegador o lembrete não é enviado. Ele chega pelo app Silpo no seu celular.
            </Text>
          ) : null}

          {enabled && isPermissionDenied ? (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                As notificações do Silpo estão desativadas neste aparelho. Ative nas configurações
                para receber o lembrete.
              </Text>
              <Button variant="ghost" size="sm" onPress={() => Linking.openSettings()}>
                Abrir configurações
              </Button>
            </View>
          ) : null}

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: '100%',
    paddingHorizontal: 20,
    gap: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  titleContainer: {
    gap: 5,
    marginTop: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  centerFeedback: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  feedbackTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.button + 2,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  warning: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.field,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  warningText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
  },
});
