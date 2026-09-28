import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/fonts';

export function Header() {
  const router = useRouter();

  return (
    <View>
      <Pressable
        onPress={() => router.back()}
        style={styles.backArrow}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </Pressable>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Outras práticas</Text>
        <Text style={styles.subtitle}>Vá no ritmo que fizer sentido para você.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backArrow: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginLeft: 15,
  },
  textContainer: {
    gap: 5,
    marginLeft: 15,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.hero,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
});
