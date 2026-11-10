import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AchievementCard } from '@/components/achievementsScreen/AchievementCard';
import { AchievementsProgressCard } from '@/components/achievementsScreen/AchievementsProgressCard';
import type { Achievement } from '@/features/achievements/achievementsService';
import { useAchievements } from './useAchievements';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

export function AchievementsScreen() {
  const router = useRouter();
  const { achievements, isLoading, hasError, retry } = useAchievements();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/jornada');
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <StatusBar style="dark" />

      <View>
        <BackButton onPress={handleBack} />
        <View style={styles.titleContainer}>
          <Text accessibilityRole="header" style={styles.title}>
            Minhas conquistas
          </Text>
          <Text style={styles.subtitle}>Pequenos passos que merecem ser lembrados.</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerFeedback}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.feedbackSubtitle}>Carregando suas conquistas...</Text>
        </View>
      ) : hasError || achievements === null ? (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>Não foi possível carregar suas conquistas</Text>
          <Text style={styles.feedbackSubtitle}>Verifique sua conexão e tente de novo.</Text>
          <Pressable
            onPress={retry}
            hitSlop={8}
            accessibilityRole="button"
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Tentar de novo</Text>
          </Pressable>
        </View>
      ) : achievements.length === 0 ? (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>Nenhuma conquista disponível por enquanto</Text>
        </View>
      ) : (
        <AchievementsList achievements={achievements} />
      )}
    </ScreenContainer>
  );
}

function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked);
  const locked = achievements.filter((achievement) => !achievement.unlocked);

  return (
    <>
      <AchievementsProgressCard unlocked={unlocked.length} total={achievements.length} />

      {unlocked.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desbloqueadas</Text>
          {unlocked.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>
      ) : null}

      {locked.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por descobrir</Text>
          {locked.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  /** Mesma largura e margem lateral da Jornada, de onde a tela é aberta. */
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
  section: {
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
