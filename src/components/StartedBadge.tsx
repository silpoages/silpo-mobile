import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

export function StartedBadge() {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
      <Text style={styles.text}>Prática iniciada</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
