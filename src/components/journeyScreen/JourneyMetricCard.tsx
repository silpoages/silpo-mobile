import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type JourneyMetricCardProps = {
  value: number;
  /** Já no singular ou plural, conforme `value`. */
  label: string;
};

export function JourneyMetricCard({ value, label }: JourneyMetricCardProps) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${value} ${label}`}
      style={styles.card}
    >
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 18,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  value: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.primary,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
