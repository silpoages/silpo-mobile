import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { JourneyHeader } from '@/components/journeyScreen/JourneyHeader';
import { JourneySummaryCard } from '@/components/journeyScreen/JourneySummaryCard';
import { JourneyMetricCard } from '@/components/journeyScreen/JourneyMetricCard';
import { MoodDistributionCard } from '@/components/journeyScreen/MoodDistributionCard';
import { AchievementsSummaryCard } from '@/components/journeyScreen/AchievementsSummaryCard';
import { useSession } from '@/features/auth/session/SessionContext';
import type { JourneyData } from './journeyService';
import { pluralize } from './pluralize';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type JourneyScreenProps = {
  /** Resumo do mês. Sem dados (ou tudo zerado), a tela mostra o estado vazio. */
  journey?: JourneyData | null;
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
};

function isJourneyEmpty(journey: JourneyData | null): journey is null {
  return (
    journey === null ||
    (journey.daysRegistered === 0 &&
      journey.practicesTried === 0 &&
      journey.exercisesCompleted === 0 &&
      journey.achievements.unlocked === 0)
  );
}

export function JourneyScreen({
  journey = null,
  isLoading = false,
  hasError = false,
  onRetry,
}: JourneyScreenProps) {
  const router = useRouter();
  const session = useSession();

  const userName = session.user?.fullName?.trim() || session.user?.email || '';

  function renderContent() {
    if (isLoading) {
      return (
        <View style={styles.centerFeedback}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.feedbackSubtitle}>Carregando sua jornada...</Text>
        </View>
      );
    }
    if (hasError) {
      return (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>Não foi possível carregar sua jornada</Text>
          <Text style={styles.feedbackSubtitle}>Verifique sua conexão e tente de novo.</Text>
          {onRetry ? (
            <Pressable
              onPress={onRetry}
              hitSlop={8}
              accessibilityRole="button"
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Tentar de novo</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }
    if (isJourneyEmpty(journey)) {
      return (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>Sua jornada começa aqui</Text>
          <Text style={styles.feedbackSubtitle}>
            Registre como você está se sentindo para acompanhar seu caminho por aqui.
          </Text>
        </View>
      );
    }
    return (
      <>
        <JourneySummaryCard daysRegistered={journey.daysRegistered} />
        <View style={styles.metricsRow}>
          <JourneyMetricCard
            value={journey.practicesTried}
            label={pluralize(
              journey.practicesTried,
              'prática diferente experimentada',
              'práticas diferentes experimentadas',
            )}
          />
          <JourneyMetricCard
            value={journey.exercisesCompleted}
            label={pluralize(
              journey.exercisesCompleted,
              'exercício concluído',
              'exercícios concluídos',
            )}
          />
        </View>
        <MoodDistributionCard moodCounts={journey.moodCounts} />
        <AchievementsSummaryCard
          unlocked={journey.achievements.unlocked}
          total={journey.achievements.total}
        />
      </>
    );
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <StatusBar style="dark" />
      <JourneyHeader userName={userName} onPressAvatar={() => router.push('/perfil')} />
      {renderContent()}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  /** Mesma largura e margem lateral da Home, para o avatar não mudar de lugar entre as abas. */
  content: {
    maxWidth: '100%',
    paddingHorizontal: 20,
    gap: spacing.xl,
    paddingTop: 22,
    paddingBottom: spacing.xl,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  centerFeedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 48,
    gap: spacing.md,
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
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
});
