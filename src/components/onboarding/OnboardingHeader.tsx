import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { colors, fontFamily, fontSize, layout, spacing } from '@/theme';

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
        <BackButton onPress={onPressBack} testID="back-button" />
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
    height: layout.backButtonSize,
  },
  backButton: {
    height: layout.backButtonSize,
    width: layout.backButtonSize,
  },
  stepLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
  },
});
