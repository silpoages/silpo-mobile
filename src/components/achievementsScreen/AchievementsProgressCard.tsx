import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { pluralize } from '@/features/journeyScreen/pluralize';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type AchievementsProgressCardProps = {
  unlocked: number;
  total: number;
};

export function AchievementsProgressCard({ unlocked, total }: AchievementsProgressCardProps) {
  const fillPercent = total > 0 ? (unlocked / total) * 100 : 0;
  const progress = `${unlocked} de ${total} ${pluralize(total, 'descoberta', 'descobertas')}`;

  return (
    <View accessible accessibilityLabel={`Seu progresso: ${progress}`} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="star" size={22} color={colors.achievement.icon} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.label}>Seu progresso</Text>
          <Text style={styles.title}>{progress}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPercent}%` }]} />
      </View>
      <Text style={styles.description}>
        Cada conquista celebra um passo no seu cuidado — sem pressa, no seu ritmo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.achievement.surface,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.achievement.surface,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.achievement.icon,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
