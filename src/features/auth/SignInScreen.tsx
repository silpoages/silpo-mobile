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
import { signIn, signInWithGoogle } from '@/features/auth/services/authService';

const GOOGLE_SIGN_IN_ERROR = 'Não foi possível entrar com o Google. Tente novamente.';

/**
 * Login de contas existentes, com alternativa de conta Google.
 *
 * O Figma não tem um frame de login no mesmo padrão das outras telas. Os
 * únicos existentes (`Login 00` e `entrar 00`, nós 4151:859 e 4151:877) são
 * rascunhos antigos, em outra linguagem visual. Esta tela usa a composição do
 * `Cadastro` (4236:951), que é o formulário espelho deste, para não introduzir
 * um estilo que não existe no design.
 */
export function SignInScreen() {
  const router = useRouter();
  const session = useSession();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [googleErrorMessage, setGoogleErrorMessage] = useState<string | null>(null);

  /** `replace` tira o login do histórico: voltar na Home não reabre esta tela. */
  async function handleSignIn(credentials: Credentials) {
    const result = await signIn(credentials);
    await session.login(result.token, result.user);
    router.replace('/');
  }

  const {
    email,
    password,
    errors,
    isSubmitting,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useAuthForm({ onSubmit: handleSignIn });

  const isBusy = isSubmitting || isGoogleSubmitting;

  async function handleGooglePress() {
    setGoogleErrorMessage(null);
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogle();
      router.replace('/');
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
          subtitle="Entre para continuar de onde você parou."
          title="Que bom te ver de novo"
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
            autoComplete="current-password"
            editable={!isBusy}
            errorMessage={errors.password}
            label="Senha"
            onChangeText={handlePasswordChange}
            onSubmitEditing={handleSubmit}
            placeholder="sua senha"
            returnKeyType="go"
            secureTextEntry
            testID="password-field"
            textContentType="password"
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
            Entrar
          </Button>

          <AuthFormFooter
            actionLabel="Cadastre-se"
            onPressAction={() => router.navigate('/cadastro')}
            question="Não tem conta?"
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
