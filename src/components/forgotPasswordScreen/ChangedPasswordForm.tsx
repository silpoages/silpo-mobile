import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

export default function ChangedPasswordForm() {
  const router = useRouter();

  return (
    <View style={styles.body}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.circle}
      >
        <Feather name="check" size={50} color={colors.surface} />
      </View>

      <Text style={styles.title}>Senha Redefinida com Sucesso!</Text>
      <Text style={styles.subtitle}>
        Tudo certo! Sua senha foi atualizada. Você já pode entrar de novo com carinho.
      </Text>

      <Button onPress={() => router.dismissTo('/login')} size="lg" testID="submit-button">
        Voltar para o login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.display,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
