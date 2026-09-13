import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, layout, radii, spacing, typography } from '@/theme';

type GoogleButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Botão de entrar com conta Google (nó 4236:980).
 *
 * O design representa a marca por um distintivo com a letra "G" sobre o verde
 * de fundo, e não pelo logotipo colorido. É isso que está reproduzido aqui.
 */
export function GoogleButton({ onPress, disabled = false, loading = false }: GoogleButtonProps) {
  const isBlocked = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !isBlocked && styles.pressed,
        isBlocked && styles.blocked,
      ]}
      testID="google-button"
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>G</Text>
          </View>
          <Text style={styles.label}>Continuar com Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.field,
    borderWidth: layout.borderWidth,
    flexDirection: 'row',
    gap: spacing.lg,
    height: layout.fieldHeight,
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    backgroundColor: colors.background,
  },
  blocked: {
    opacity: 0.6,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  badgeLabel: {
    ...typography.pill,
    color: colors.primary,
    fontFamily: fontFamily.extraBold,
  },
  label: {
    ...typography.socialButton,
    color: colors.text,
  },
});
