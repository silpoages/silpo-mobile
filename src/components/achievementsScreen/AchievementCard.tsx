import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { Achievement } from '@/features/achievementsScreen/achievementsMock';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type AchievementCardProps = {
  achievement: Achievement;
};

function formatUnlockedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { unlockedAt } = achievement;
  const isUnlocked = unlockedAt !== null;
  const progress = achievement.progress;
  const fillPercent =
    progress && progress.target > 0 ? Math.min(progress.current / progress.target, 1) * 100 : 0;

  const status = unlockedAt
    ? `Desbloqueada em ${formatUnlockedDate(unlockedAt)}`
    : progress
      ? `${progress.current} de ${progress.target}`
      : 'Ainda por descobrir';

  return (
    <View
      accessible
      accessibilityLabel={`${achievement.title}. ${achievement.description} ${status}.`}
      style={[styles.card, !isUnlocked && styles.cardLocked]}
    >
      <View style={[styles.iconContainer, !isUnlocked && styles.iconContainerLocked]}>
        <Ionicons
          name={achievement.iconName}
          size={22}
          color={isUnlocked ? colors.achievement.icon : colors.textMuted}
        />
        {!isUnlocked ? (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, !isUnlocked && styles.titleLocked]}>{achievement.title}</Text>
        <Text style={styles.description}>{achievement.description}</Text>

        {!isUnlocked && progress ? (
          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${fillPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{status}</Text>
          </View>
        ) : (
          <View style={styles.statusRow}>
            {isUnlocked ? (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            ) : null}
            <Text style={[styles.statusText, isUnlocked && styles.statusTextUnlocked]}>
              {status}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  cardLocked: {
    borderColor: colors.borderSubtle,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.achievement.surface,
  },
  iconContainerLocked: {
    backgroundColor: colors.surfaceMuted,
  },
  lockBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  titleLocked: {
    color: colors.textSecondary,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statusTextUnlocked: {
    color: colors.primary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.sm,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.chartFill,
  },
  progressText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
