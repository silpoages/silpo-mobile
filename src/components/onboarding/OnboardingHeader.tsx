import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

const TOTAL_STEPS = 3;

type OnboardingHeaderProps = {
  step: number;
  /** Ausente na etapa 1: sair do fluxo só volta para cá. */
  onPressBack?: () => void;
};

/** Cabeçalho das 3 etapas do onboarding: voltar, progresso e "N de 3" (nó 4236:989). */
export function OnboardingHeader({ step, onPressBack }: OnboardingHeaderProps) {
  return (
    <View style={styles.row}>
      {onPressBack ? (
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={spacing.md}
          onPress={onPressBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          testID="back-button"
        >
          <ChevronLeftIcon />
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}

      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

      <Text style={styles.stepLabel}>
        {step} de {TOTAL_STEPS}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    height: 44,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radii.field,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backButtonPressed: {
    backgroundColor: colors.surface,
  },
  stepLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
  },
});
