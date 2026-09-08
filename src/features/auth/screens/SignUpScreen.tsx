import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, ScreenContainer, TextField } from '@/components';
import type { AuthStackParamList } from '@/navigation/types';
import { colors, layout, spacing, typography } from '@/theme';
import { AuthDivider, AuthFormFooter, AuthHeader, GoogleButton } from '@/features/auth/components';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { signInWithGoogle, signUp } from '@/features/auth/services/authService';

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

/**
 * Cadastro por e-mail e senha, com alternativa de conta Google.
 *
 * Reproduz o frame `Cadastro` (4236:951) do Figma.
 */
export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const {
    email,
    password,
    errors,
    isSubmitting,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useAuthForm({ onSubmit: signUp });

  const isBusy = isSubmitting || isGoogleSubmitting;

  async function handleGooglePress() {
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogle();
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <AuthHeader
          onPressBack={navigation.goBack}
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
            onPressAction={() => navigation.navigate('SignIn')}
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
