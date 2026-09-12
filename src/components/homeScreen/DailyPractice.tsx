import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';

export type DailyPracticeProps = {
  title: string;
  description: string;
};

export function DailyPractice({ title, description }: DailyPracticeProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>PRÁTICA DO DIA</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Quero tentar</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonText}>Ver outras</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    minHeight: 196,
    borderColor: colors.border,
    borderWidth: 1,
    gap: 11,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    color: colors.text,
    letterSpacing: 0,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    letterSpacing: 0,
    lineHeight: 20,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  pressed: {
    opacity: 0.85,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: colors.primary,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textInverse,
  },
  secondaryButton: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
});
