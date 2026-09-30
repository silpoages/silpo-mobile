import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import { colors, fontFamily, fontSize } from '@/theme';

export function Header() {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  }

  return (
    <View>
      <BackButton onPress={handleBack} />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Outras práticas</Text>
        <Text style={styles.subtitle}>Vá no ritmo que fizer sentido para você.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    gap: 5,
    marginTop: 12,
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
