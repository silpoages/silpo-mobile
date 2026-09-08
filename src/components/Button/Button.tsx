import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, layout, radii, typography } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
};

/**
 * Botão de ação das telas de autenticação.
 *
 * `primary` é o preenchido e `secondary` o contornado, como nos nós 4236:949 e
 * 4346:11281 do Figma. Durante o carregamento o botão fica inativo e troca o
 * rótulo pelo indicador, atendendo ao critério de aceite da tarefa.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isBlocked = disabled || loading;
  const labelColor = isPrimary ? colors.text.inverse : colors.brand.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      disabled={isBlocked}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && !isBlocked && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        isBlocked && styles.blocked,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <Text numberOfLines={1} style={[styles.label, { color: labelColor }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.button,
    height: layout.buttonHeight,
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: colors.brand.primary,
  },
  primaryPressed: {
    backgroundColor: colors.brand.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.brand,
    borderWidth: layout.borderWidth,
  },
  secondaryPressed: {
    backgroundColor: colors.background.canvas,
  },
  blocked: {
    opacity: 0.6,
  },
  label: {
    ...typography.button,
  },
});
