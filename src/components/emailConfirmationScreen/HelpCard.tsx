import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoIcon } from '@/components/icons/InfoIcon';
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

type HelpCardProps = {
  onPressChangeEmail: () => void;
};

export function HelpCard({ onPressChangeEmail }: HelpCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.tip}>
        <InfoIcon />
        <Text style={styles.tipText}>
          Não encontrou? Confira as pastas de spam ou promoções. Pode levar alguns minutos.
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.changeRow}>
        <Text style={styles.question}>E-mail errado?</Text>

        <Pressable accessibilityRole="button" onPress={onPressChangeEmail}>
          <Text style={styles.action}>Alterar e-mail</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: radii.button + 2,
    borderWidth: 1,
    gap: spacing.lg,
    marginTop: spacing.xxl,
    padding: spacing.xl,
  },
  tip: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  tipText: {
    color: colors.textSecondary,
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: colors.borderSubtle,
    height: 1,
  },
  changeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  question: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  action: {
    color: colors.primary,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.md,
  },
});
