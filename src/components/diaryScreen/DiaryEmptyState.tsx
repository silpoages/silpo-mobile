import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type DiaryEmptyStateProps = {
  onCreateEntry: () => void;
};

export function DiaryEmptyState({ onCreateEntry }: DiaryEmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>SEU ESPAÇO, SEM PRESSA</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Nenhum registro por aqui ainda.
      </Text>
      <Text style={styles.description}>
        Quando sentir vontade, guarde uma frase, uma lembrança ou só o que está passando por você
        agora.
      </Text>
      <Button onPress={onCreateEntry} size="lg" style={styles.button}>
        Criar meu primeiro registro →
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  eyebrow: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
