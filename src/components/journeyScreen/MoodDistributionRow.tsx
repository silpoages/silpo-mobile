import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { pluralize } from '@/features/journeyScreen/pluralize';
import { colors, fontFamily, fontSize } from '@/theme';

type MoodDistributionRowProps = {
  iconName: ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  count: number;
  /** Maior contagem entre as emoções: a barra dela ocupa a largura toda. */
  maxCount: number;
};

export function MoodDistributionRow({
  iconName,
  label,
  count,
  maxCount,
}: MoodDistributionRowProps) {
  const fillPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${count} ${pluralize(count, 'dia', 'dias')}`}
      style={styles.row}
    >
      <MaterialCommunityIcons name={iconName} size={24} color={colors.textSecondary} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPercent}%` }]} />
      </View>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    width: 76,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.chartFill,
  },
  count: {
    minWidth: 16,
    textAlign: 'right',
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
