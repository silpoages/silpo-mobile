import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme';

export type Practice = {
  id: string;
  title: string;
  description: string;
};

type PracticeCardProps = {
  practice: Practice;
  onPress?: (practice: Practice) => void;
};

export function PracticeCard({ practice, onPress }: PracticeCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>PRÁTICA DO BEM</Text>
      <Text style={styles.cardTitle}>{practice.title}</Text>
      <Text style={styles.cardDescription}>{practice.description}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Quero tentar: ${practice.title}`}
        onPress={() => onPress?.(practice)}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>Quero tentar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 11,
  },
  cardLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    color: colors.text,
  },
  cardDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textInverse,
  },
  pressed: {
    opacity: 0.85,
  },
});
