import { StyleSheet, Text, View } from 'react-native';
import { EMOTIONS } from '@/components/emotions/emotionConfig';
import type { MoodId } from '@/components/emotions/moodLogService';
import { MoodDistributionRow } from './MoodDistributionRow';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type MoodDistributionCardProps = {
  moodCounts: Partial<Record<MoodId, number>>;
};

export function MoodDistributionCard({ moodCounts }: MoodDistributionCardProps) {
  const rows = EMOTIONS.map((emotion) => ({ ...emotion, count: moodCounts[emotion.id] ?? 0 }))
    .filter((emotion) => emotion.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCount = rows[0]?.count ?? 0;

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        Como você tem se sentido
      </Text>

      {rows.length === 0 ? (
        <Text style={styles.footnote}>Nenhuma emoção registrada este mês.</Text>
      ) : (
        <View style={styles.rows}>
          {rows.map((emotion) => (
            <MoodDistributionRow
              key={emotion.id}
              iconName={emotion.iconName}
              label={emotion.journeyLabel}
              count={emotion.count}
              maxCount={maxCount}
            />
          ))}
        </View>
      )}

      <View style={styles.divider} />
      <Text style={styles.footnote}>Todas as emoções têm lugar aqui. Registrar já é cuidar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  rows: {
    gap: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
