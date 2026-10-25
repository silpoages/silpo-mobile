import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pluralize } from '@/features/journeyScreen/pluralize';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type ContinueJourneyCardProps = {
  /** Dias do mês com emoção registrada. `null` enquanto o resumo não está disponível. */
  daysRegistered: number | null;
  onPress: () => void;
};

function getDescription(daysRegistered: number | null): string {
  if (daysRegistered === null) {
    return 'Veja como foi o seu mês até aqui.';
  }
  if (daysRegistered === 0) {
    return 'Registre como você está se sentindo para começar a sua jornada.';
  }
  return `Você registrou como estava se sentindo em ${daysRegistered} ${pluralize(daysRegistered, 'dia', 'dias')} este mês.`;
}

export function ContinueJourneyCard({ daysRegistered, onPress }: ContinueJourneyCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue sua jornada"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="leaf-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Continue sua jornada</Text>
        <Text style={styles.description}>{getDescription(daysRegistered)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceTint,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 20,
  },
});
