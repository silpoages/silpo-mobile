import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, ScreenContainer, TextField } from '@/components';
import type { AuthStackParamList } from '@/navigation/types';
import { colors, layout, spacing, typography } from '@/theme';
import { AuthDivider, AuthFormFooter, AuthHeader, GoogleButton } from '@/features/auth/components';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { signIn, signInWithGoogle } from '@/features/auth/services/authService';
import { validateRequiredPassword } from '@/features/auth/validation/authValidation';

type SignInScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

/**
 * Login de contas existentes, com alternativa de conta Google.
 *
 * O Figma não tem um frame de login no mesmo padrão das outras telas — os
 * únicos existentes (`Login 00` e `entrar 00`, nós 4151:859 e 4151:877) são
 * rascunhos antigos, em outra linguagem visual. Esta tela usa a composição do
 * `Cadastro` (4236:951), que é o formulário espelho deste, para não introduzir
 * um estilo que não existe no design.
 */
export function SignInScreen({ navigation }: SignInScreenProps) {
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const {
    email,
    password,
    errors,
    isSubmitting,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useAuthForm({ onSubmit: signIn, passwordValidator: validateRequiredPassword });

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
            onPressAction={() => navigation.navigate('SignUp')}
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
