import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../theme';

/** Separador "ou" entre o formulário e o login social (nó 4236:975). */
export function AuthDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.rule} />
      <Text style={styles.label}>ou</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    height: 20,
  },
  rule: {
    backgroundColor: colors.border.subtle,
    flex: 1,
    height: 1,
  },
  label: {
    ...typography.divider,
    color: colors.text.muted,
  },
});
