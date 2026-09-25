import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radii, spacing, typography } from '@/theme';

type StepItemProps = {
  number: number;
  text: string;
};

export function StepItem({ number, text }: StepItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{number}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  badge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  text: {
    ...typography.subtitle,
    flex: 1,
    color: colors.text,
  },
});
