import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { colors, layout, radii, spacing, typography } from '@/theme';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  onPressBack: () => void;
};

/**
 * Cabeçalho das telas de formulário: voltar, título e texto de apoio.
 *
 * Estrutura do nó 4236:953 do Figma — o botão de voltar tem 44 × 44 com o ícone
 * centralizado, e não há espaço entre ele e o título.
 */
export function AuthHeader({ title, subtitle, onPressBack }: AuthHeaderProps) {
  return (
    <View>
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

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.field,
    height: layout.backButtonSize,
    justifyContent: 'center',
    width: layout.backButtonSize,
  },
  backButtonPressed: {
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: layout.titleGap,
  },
});
