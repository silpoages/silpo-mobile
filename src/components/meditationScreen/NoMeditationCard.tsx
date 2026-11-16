import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';

const title = 'Ainda não há meditações disponíveis';
const description =
  'Assim que novas meditações forem publicadas, elas aparecem aqui. Enquanto isso, que tal uma respiração guiada?';

const kicker = 'POR ENQUANTO';

export default function NoMeditationCard() {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button onPress={() => router.push('/respiracao')}>Fazer uma respiração</Button>
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
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
});
