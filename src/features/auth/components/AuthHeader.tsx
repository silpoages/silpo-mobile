import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { colors, layout, typography } from '@/theme';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  onPressBack: () => void;
};

/**
 * Cabeçalho das telas de formulário: voltar, título e texto de apoio.
 *
 * Estrutura do nó 4236:953 do Figma: o botão de voltar tem 44 × 44 com o ícone
 * centralizado, e não há espaço entre ele e o título.
 */
export function AuthHeader({ title, subtitle, onPressBack }: AuthHeaderProps) {
  return (
    <View>
      <BackButton onPress={onPressBack} testID="back-button" />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
