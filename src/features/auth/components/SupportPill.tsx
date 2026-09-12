import { Pressable, StyleSheet, Text } from 'react-native';

import { HeartIcon } from '@/components/icons';
import { colors, layout, radii, typography } from '@/theme';

type SupportPillProps = {
  onPress: () => void;
};

/**
 * Selo de apoio imediato no topo da tela de boas-vindas (nó 4346:11272).
 *
 * Leva à tela de Apoio (`/apoio`), acessível mesmo sem estar logado.
 */
export function SupportPill({ onPress }: SupportPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <HeartIcon />
      <Text style={styles.label}>Preciso de apoio agora</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.support.surface,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: layout.supportPillGap,
    height: layout.supportPillHeight,
    paddingHorizontal: layout.fieldPaddingHorizontal,
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    ...typography.pill,
    color: colors.support.dark,
  },
});
