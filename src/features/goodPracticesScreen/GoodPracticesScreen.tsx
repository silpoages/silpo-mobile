import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StartedBadge } from '@/components/goodPracticesScreen/StartedBadge';
import { StepItem } from '@/components/goodPracticesScreen/StepItem';
import { colors, radii, spacing, typography } from '@/theme';

const GUIDANCE_STEPS = [
  'Respire fundo uma vez antes de começar.',
  'Vá no seu tempo — não existe pressa nem jeito certo.',
  'Se preferir voltar, tudo bem. Tentar já conta.',
];

type GoodPracticesScreenProps = {
  title: string;
  description: string;
};

export function GoodPracticesScreen({ title, description }: GoodPracticesScreenProps) {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  }

  function handleStartPractice() {
    setIsStarted(true);
  }

  return (
    <ScreenContainer background={colors.surfaceTint} contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <BackButton onPress={handleClose} />
      </View>

      <View style={styles.textBox}>
        <Text style={styles.label}>Prática do bem</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {isStarted && <StartedBadge style={styles.startedBadge} />}

      <View style={styles.card}>
        <Text style={styles.label}>Se quiser, um caminho</Text>
        {GUIDANCE_STEPS.map((step, index) => (
          <StepItem key={step} number={index + 1} text={step} />
        ))}
      </View>

      <View style={styles.footer}>
        {isStarted ? (
          <>
            <Button size="lg" testID="finish-practice-button" onPress={handleClose}>
              Concluir prática
            </Button>
            <Button
              variant="ghost"
              size="md"
              testID="postpone-practice-button"
              onPress={handleClose}
            >
              Deixar para depois
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" testID="start-practice-button" onPress={handleStartPractice}>
              Começar agora
            </Button>
            <Button
              variant="ghost"
              size="md"
              testID="dismiss-practice-button"
              onPress={handleClose}
            >
              Agora não
            </Button>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  textBox: {
    width: '100%',
    gap: spacing.md,
  },
  label: {
    ...typography.fieldLabel,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  startedBadge: {
    marginTop: spacing.lg,
  },
  card: {
    width: '100%',
    marginTop: spacing.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  footer: {
    width: '100%',
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
});
