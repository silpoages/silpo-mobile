import { StyleSheet, Text, View } from 'react-native';

import { HeartIcon } from '../../../components/icons';
import { colors, layout, radii, typography } from '../../../theme';

/**
 * Selo de apoio imediato no topo da tela de boas-vindas (nó 4346:11272).
 *
 * Segue estático porque o fluxo de Apoio ainda não existe no app; basta trocar
 * por um `Pressable` quando houver destino para ele.
 */
export function SupportPill() {
  return (
    <View style={styles.pill}>
      <HeartIcon />
      <Text style={styles.label}>Preciso de apoio agora</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.background.support,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: layout.supportPillGap,
    height: layout.supportPillHeight,
    paddingHorizontal: layout.fieldPaddingHorizontal,
  },
  label: {
    ...typography.pill,
    color: colors.text.support,
  },
});
