import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { MeditationHeader } from '@/components/meditationScreen/MeditationHeader';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type MeditationSelectionProps = {
  title: string;
  description: string;
  time: number;
  preparationTitle: string;
  preparationSteps: string[];
  buttonMain: {
    text: string;
    onPress: () => void;
  };
  buttonSecondary: {
    text: string;
    onPress: () => void;
  };
};

export function MeditationSelection({
  title,
  description,
  time,
  preparationTitle,
  preparationSteps,
  buttonMain,
  buttonSecondary,
}: MeditationSelectionProps) {
  return (
    <View style={styles.container}>
      <MeditationHeader
        kicker={`MEDITAÇÃO GUIADA · ${time} MIN`}
        title={title}
        subtitle={description}
      />
      <View style={styles.preparationCard}>
        <Text style={styles.cardCaption}>{preparationTitle}</Text>
        {preparationSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <Button size="lg" onPress={buttonMain.onPress}>
          {buttonMain.text}
        </Button>
        <Button variant="ghost" onPress={buttonSecondary.onPress}>
          {buttonSecondary.text}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  preparationCard: {
    width: '100%',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  cardCaption: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.surfaceTint,
  },
  stepNumberText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.text,
  },
  actions: {
    gap: spacing.sm,
  },
});
