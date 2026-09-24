import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';

type ExampleCardProps = {
  title: string;
  description: string;
};

export default function ExampleCard({ title, description }: ExampleCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>TEMPLATE</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 18,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
  },
  kicker: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.72,
    color: colors.textMuted,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
});
