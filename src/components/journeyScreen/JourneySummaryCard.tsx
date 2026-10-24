import { StyleSheet, Text, View } from 'react-native';
import { pluralize } from '@/features/journeyScreen/pluralize';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type JourneySummaryCardProps = {
  daysRegistered: number;
};

export function JourneySummaryCard({ daysRegistered }: JourneySummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Sua jornada até aqui</Text>
      <Text style={styles.title}>
        Você registrou como estava se sentindo em {daysRegistered}{' '}
        {pluralize(daysRegistered, 'dia', 'dias')} este mês.
      </Text>
      <Text style={styles.description}>Cada registro é um cuidado com você — no seu ritmo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    lineHeight: 22,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
