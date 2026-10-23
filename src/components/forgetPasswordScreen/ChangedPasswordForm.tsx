import Button from '@/components/Button';
import { colors, fontSize, fontFamily } from '@/theme';
import { spacing } from '@/theme/spacing';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ChangedPasswordForm() {
  const router = useRouter();

  return (
    <View style={styles.body}>
      <View style={styles.circle}>
        <Feather name="check" size={50} color={colors.surface} />
      </View>

      <Text style={styles.title}>Senha Redefinida com Sucesso!</Text>
      <Text style={styles.subtitle}>
        Tudo certo! Sua senha foi atualizada. Você já pode entrar de novo com carinho.
      </Text>

      <Button onPress={() => router.push('/login')} size="lg" testID="submit-button">
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
