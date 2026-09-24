import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BackButton } from '@/components/BackButton';
import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StartedBadge } from '@/components/StartedBadge';
import { StepItem } from '@/components/StepItem';
import { colors, fontFamily, fontSize, radii, spacing, typography } from '@/theme';

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

      <View style={styles.content}>
        <View style={styles.textBox}>
          <Text style={styles.eyebrow}>Prática do bem</Text>
          {/* alterar para receber o título da prática aqui.*/}
          <Text style={styles.title}>{'Sentar em um parque'}</Text>
          {/* alterar para receber a descrição da prática aqui.*/}
          <Text style={styles.description}>
            {'Escolha um banco tranquilo e fique o tempo que for confortável. Só isso já conta'}
          </Text>
        </View>

        {isStarted && <StartedBadge />}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Se quiser, um caminho</Text>
          {GUIDANCE_STEPS.map((step, index) => (
            <StepItem key={step} number={index + 1} text={step} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {isStarted ? (
          <>
            <Button size="lg" onPress={handleClose}>
              Concluir prática
            </Button>
            <Button variant="secondary" size="lg" style={styles.ghostButton} onPress={handleClose}>
              Deixar para depois
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" onPress={handleStartPractice}>
              Começar agora
            </Button>
            <Button variant="secondary" size="lg" style={styles.ghostButton} onPress={handleClose}>
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
  },
  content: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.xxl,
  },
  textBox: {
    width: '100%',
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  card: {
    width: '100%',
    padding: spacing.xl,
    gap: spacing.lg,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.text,
  },
  footer: {
    width: '100%',
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});
