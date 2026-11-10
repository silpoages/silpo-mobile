import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AchievementCard } from '@/components/achievementsScreen/AchievementCard';
import { AchievementsProgressCard } from '@/components/achievementsScreen/AchievementsProgressCard';
import { ACHIEVEMENTS_MOCK, type Achievement } from './achievementsMock';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type AchievementsScreenProps = {
  /** Enquanto o backend não expõe as conquistas, a tela usa os dados provisórios. */
  achievements?: Achievement[];
};

export function AchievementsScreen({ achievements = ACHIEVEMENTS_MOCK }: AchievementsScreenProps) {
  const router = useRouter();

  const unlocked = achievements.filter((achievement) => achievement.unlockedAt !== null);
  const locked = achievements.filter((achievement) => achievement.unlockedAt === null);

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
    </ScreenContainer>
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
