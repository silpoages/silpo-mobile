import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../theme';

type AuthFormFooterProps = {
  question: string;
  actionLabel: string;
  onPressAction: () => void;
};

/**
 * Linha "Já tem conta? Entrar" — pergunta com o link que troca de tela.
 *
 * Alinhada à esquerda e com 4 de espaço entre as partes, como o nó 4236:971.
 */
export function AuthFormFooter({ question, actionLabel, onPressAction }: AuthFormFooterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <Pressable accessibilityRole="link" hitSlop={spacing.md} onPress={onPressAction}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  question: {
    ...typography.linkQuestion,
    color: colors.text.secondary,
  },
  action: {
    ...typography.link,
    color: colors.brand.primary,
  },
});
