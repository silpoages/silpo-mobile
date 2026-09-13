import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { colors, layout, spacing, typography } from '@/theme';
import { AuthDivider, AuthFormFooter, AuthHeader, GoogleButton } from '@/features/auth/components';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { useSession } from '@/features/auth/session/SessionContext';
import type { Credentials } from '@/features/auth/services/authService';
import { register, signInWithGoogle } from '@/features/auth/services/authService';
import { validateNewPassword } from '@/features/auth/validation/authValidation';

const GOOGLE_SIGN_IN_ERROR = 'Não foi possível continuar com o Google. Tente novamente.';

/** Cadastro ("Vamos começar juntos", nó 4236:951) — registro não devolve token, então logamos em seguida. */
export function RegisterScreen() {
  const router = useRouter();
  const session = useSession();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [googleErrorMessage, setGoogleErrorMessage] = useState<string | null>(null);

  async function handleRegister(credentials: Credentials) {
    const result = await register(credentials);
    await session.login(result.token, result.user);
    router.replace('/onboarding/etapa-1');
  }

  const {
    email,
    password,
    errors,
    isSubmitting,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useAuthForm({ onSubmit: handleRegister, validatePassword: validateNewPassword });

  const isBusy = isSubmitting || isGoogleSubmitting;

  async function handleGooglePress() {
    setGoogleErrorMessage(null);
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogle();
      router.replace('/onboarding/etapa-1');
    } catch {
      setGoogleErrorMessage(GOOGLE_SIGN_IN_ERROR);
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <AuthHeader
          onPressBack={() => router.back()}
          subtitle="Leva menos de um minuto. Você controla seus dados."
          title="Vamos começar juntos"
        />

        <View style={styles.form}>
          <TextField
            autoComplete="email"
            editable={!isBusy}
            errorMessage={errors.email}
            keyboardType="email-address"
            label="E-mail"
            onChangeText={handleEmailChange}
            placeholder="seu@email.com"
            returnKeyType="next"
            testID="email-field"
            textContentType="emailAddress"
            value={email}
          />

          <TextField
            autoComplete="new-password"
            editable={!isBusy}
            errorMessage={errors.password}
            label="Senha"
            onChangeText={handlePasswordChange}
            onSubmitEditing={handleSubmit}
            placeholder="mínimo de 8 caracteres"
            returnKeyType="go"
            secureTextEntry
            testID="password-field"
            textContentType="newPassword"
            value={password}
          />

          {errors.form ? (
            <Text accessibilityRole="alert" style={styles.formError}>
              {errors.form}
            </Text>
          ) : null}

          <Button
            disabled={isGoogleSubmitting}
            loading={isSubmitting}
            onPress={handleSubmit}
            size="lg"
            testID="submit-button"
          >
            Criar conta
          </Button>

          <AuthFormFooter
            actionLabel="Entrar"
            onPressAction={() => router.navigate('/login')}
            question="Já tem conta?"
          />
        </View>

        <View style={styles.divider}>
          <AuthDivider />
        </View>

        <GoogleButton
          disabled={isSubmitting}
          loading={isGoogleSubmitting}
          onPress={handleGooglePress}
        />

        {googleErrorMessage ? (
          <Text accessibilityRole="alert" style={[styles.formError, styles.googleError]}>
            {googleErrorMessage}
          </Text>
        ) : null}

        <Text style={styles.privacyNote}>
          Seus registros de emoção são privados e ficam com você.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  form: {
    gap: spacing.xl,
    marginTop: layout.formGap,
  },
  formError: {
    ...typography.footnote,
    color: colors.danger,
  },
  googleError: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  divider: {
    marginVertical: spacing.xxl,
  },
  privacyNote: {
    ...typography.footnote,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
