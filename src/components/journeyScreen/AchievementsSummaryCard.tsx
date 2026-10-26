import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pluralize } from '@/features/journeyScreen/pluralize';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type AchievementsSummaryCardProps = {
  unlocked: number;
  total: number;
  /** Sem destino (tela de conquistas ainda não existe), o card não é pressionável. */
  onPress?: () => void;
};

export function AchievementsSummaryCard({
  unlocked,
  total,
  onPress,
}: AchievementsSummaryCardProps) {
  const progress = `${unlocked} de ${total} ${pluralize(total, 'descoberta', 'descobertas')}`;

  return (
    <Pressable
      accessible
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Minhas conquistas: ${progress}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="star-outline" size={20} color={colors.achievement.icon} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Minhas conquistas</Text>
        <Text style={styles.description}>{progress}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.achievement.surface,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
