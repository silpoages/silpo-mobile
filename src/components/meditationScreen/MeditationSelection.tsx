import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BackButton } from '@/components/BackButton';
import Button from '@/components/Button';
import { MeditationHeader } from '@/components/meditationScreen/MeditationHeader';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

const PREPARATION_STEPS = [
  'Encontre uma posição confortável, sentado ou deitado.',
  'Se puder, use fones de ouvido.',
  'Você pode pausar ou encerrar quando quiser.',
];

type MeditationSelectionProps = {
  title: string;
  description: string;
  time: number;
  onPressBack: () => void;
};

export function MeditationSelection({
  title,
  description,
  time,
  onPressBack,
}: MeditationSelectionProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <BackButton onPress={onPressBack} />
      <MeditationHeader
        kicker={`MEDITAÇÃO GUIADA · ${time} MIN`}
        title={title}
        subtitle={description}
      />
      <View style={styles.preparationCard}>
        <Text style={styles.cardCaption}>ANTES DE COMEÇAR</Text>
        {PREPARATION_STEPS.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <Button size="lg" onPress={() => router.push('/meditacao-player')}>
          Começar meditação
        </Button>
        <Button variant="ghost" onPress={onPressBack}>
          Agora não
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
