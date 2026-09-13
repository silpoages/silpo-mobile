import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/theme';

type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

/** Barra de progresso do onboarding (nó 4236:993 do Figma). */
export function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const progress = Math.min(1, Math.max(0, step / totalSteps));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: '100%',
  },
});
