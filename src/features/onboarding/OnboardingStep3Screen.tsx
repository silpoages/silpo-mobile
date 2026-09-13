import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { useSession } from '@/features/auth/session/SessionContext';
import { toISODate } from '@/features/onboarding/date';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { ApiError } from '@/services/apiClient';
import { updateCurrentUser } from '@/services/user';
import { colors, fontFamily, fontSize, radii, spacing, typography } from '@/theme';

const GENERIC_ERROR_MESSAGE = 'Não foi possível salvar agora. Tente novamente.';

/** Etapa 3 de 3: lembrete diário (nó 4236:1054 do Figma). */
export function OnboardingStep3Screen() {
  const router = useRouter();
  const session = useSession();
  const { fullName, birthDate, gender, dailyReminderEnabled, setDailyReminderEnabled } =
    useOnboarding();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function finishOnboarding(reminderEnabled: boolean) {
    if (!session.token || !session.user || !birthDate || !gender) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const updated = await updateCurrentUser(session.token, {
        fullName: fullName.trim(),
        birthDate: toISODate(birthDate),
        gender,
        dailyReminderEnabled: reminderEnabled,
      });

      await session.login(session.token, {
        ...session.user,
        fullName: updated.fullName,
        onboardingCompleted: updated.onboardingCompleted,
      });

      router.replace('/');
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <OnboardingHeader onPressBack={() => router.back()} step={3} />

        <View style={styles.content}>
          <Text style={styles.title}>Podemos te lembrar com carinho?</Text>
          <Text style={styles.subtitle}>
            No máximo um lembrete gentil por dia. Nada de cobranças — você ajusta ou desliga quando
            quiser.
          </Text>

          <View style={styles.card}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Lembrete diário</Text>
              <Text style={styles.cardSubtitle}>&quot;Como você está se sentindo hoje?&quot;</Text>
            </View>

            <Switch
              disabled={isSubmitting}
              ios_backgroundColor={colors.border}
              onValueChange={setDailyReminderEnabled}
              testID="daily-reminder-switch"
              thumbColor={
                Platform.OS === 'android' && dailyReminderEnabled ? colors.surface : undefined
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              value={dailyReminderEnabled}
            />
          </View>
        </View>

        {errorMessage ? (
          <Text accessibilityRole="alert" style={styles.formError}>
            {errorMessage}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            loading={isSubmitting}
            onPress={() => finishOnboarding(dailyReminderEnabled)}
            size="lg"
            testID="finish-button"
          >
            Concluir
          </Button>

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => finishOnboarding(false)}
            style={styles.skipButton}
            testID="skip-button"
          >
            <Text style={styles.skipLabel}>Pular esta etapa</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.button + 2,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.xxl,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  formError: {
    ...typography.footnote,
    color: colors.danger,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  skipLabel: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
});
