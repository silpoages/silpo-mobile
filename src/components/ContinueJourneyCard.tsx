import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';

type ContinueJourneyCardProps = {
  daysRegistered?: number;
};

export function ContinueJourneyCard({ daysRegistered = 8 }: ContinueJourneyCardProps) {
  return (
    <View style={styles.card} accessibilityLabel="Continue sua jornada">
      <View style={styles.iconContainer}>
        <Ionicons name="leaf-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Continue sua jornada</Text>
        <Text style={styles.description}>
          Você registrou como estava se sentindo em {daysRegistered} dias este mês.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
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
    gap: 4,
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
