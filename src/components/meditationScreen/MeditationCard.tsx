import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';
import Button from '@/components/Button';

type CardProps = {
  title: string;
  description: string;
  time?: number;
  onPress?: () => void;
};

export default function MeditationCard({ title, description, time, onPress }: CardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>MEDITAÇÃO GUIADA · {time} MIN</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <Button onPress={onPress}>Ouvir Meditação</Button>
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
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.72,
    color: colors.primary,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.title,
    color: colors.text,
  },
  description: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
});
