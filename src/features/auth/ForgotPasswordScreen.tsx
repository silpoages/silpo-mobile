import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/ScreenContainer';
import ChangedPasswordForm from '@/components/forgotPasswordScreen/ChangedPasswordForm';
import EmailForm from '@/components/forgotPasswordScreen/EmailForm';
import NewPasswordForm from '@/components/forgotPasswordScreen/NewPasswordForm';
import VerificationCodeForm from '@/components/forgotPasswordScreen/VerificationCodeForm';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { validateEmail, validateNewPassword } from '@/features/auth/validation/authValidation';
import { colors, layout, spacing, typography } from '@/theme';

const CODE_LENGTH = 6;

/**
 * Recuperação de senha em 4 etapas: e-mail, código, nova senha e confirmação.
 *
 * Ainda só a interface: nenhuma etapa chama o backend.
 */
export function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmationError, setConfirmationError] = useState<string>();

  /** Sem login na pilha (tela aberta por URL), `dismissTo` troca esta tela pelo login. */
  function handleBack() {
    if (step > 1) {
      setStep((currentStep) => currentStep - 1);
      return;
    }

    router.dismissTo('/login');
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailError(undefined);
  }

  function handleCodeChange(value: string) {
    setCode(value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH));
    setCodeError(undefined);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordError(undefined);
    setConfirmationError(undefined);
  }

  function handlePasswordConfirmationChange(value: string) {
    setPasswordConfirmation(value);
    setConfirmationError(undefined);
  }

  function handleSubmit() {
    if (step === 1) {
      const error = validateEmail(email);

      if (error) {
        setEmailError(error);
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (code.length !== CODE_LENGTH) {
        setCodeError(`Digite o código de ${CODE_LENGTH} dígitos.`);
        return;
      }

      setStep(3);
      return;
    }

    const error = validateNewPassword(password);

    if (error) {
      setPasswordError(error);
      return;
    }

    if (!passwordConfirmation) {
      setConfirmationError('Confirme sua nova senha.');
      return;
    }

    if (password !== passwordConfirmation) {
      setConfirmationError('As senhas não coincidem.');
      return;
    }

    setStep(4);
  }

  const headers = [
    {
      title: 'Recupere o acesso à sua conta',
      subtitle: 'Sem problemas. Digite o e-mail da sua conta para recuperar o acesso.',
    },
    {
      title: 'Verifique seu e-mail',
      subtitle: `Digite o código de ${CODE_LENGTH} dígitos enviado para ${email.trim()}.`,
    },
    {
      title: 'Crie uma nova senha',
      subtitle: 'Crie uma nova senha para voltar a acessar sua conta.',
    },
  ];
  const header = headers[step - 1];

  return (
    <ScreenContainer>
      <View style={styles.body}>
        {/* A etapa final tem título próprio e não volta para o formulário de senha. */}
        {header ? (
          <AuthHeader onPressBack={handleBack} subtitle={header.subtitle} title={header.title} />
        ) : null}

        <View style={styles.form}>
          {step === 1 ? (
            <EmailForm
              email={email}
              error={emailError}
              onChangeEmail={handleEmailChange}
              onSubmit={handleSubmit}
            />
          ) : step === 2 ? (
            <VerificationCodeForm
              code={code}
              error={codeError}
              onChangeCode={handleCodeChange}
              onSubmit={handleSubmit}
            />
          ) : step === 3 ? (
            <NewPasswordForm
              confirmationError={confirmationError}
              onChangePassword={handlePasswordChange}
              onChangePasswordConfirmation={handlePasswordConfirmationChange}
              onSubmit={handleSubmit}
              password={password}
              passwordConfirmation={passwordConfirmation}
              passwordError={passwordError}
            />
          ) : (
            <ChangedPasswordForm />
          )}
        </View>

        <Text style={styles.privacyNote}>Seus dados são privados e ficam com você.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xl,
  },
  form: {
    gap: spacing.xl,
    marginTop: layout.formGap,
  },
  /** `marginTop: 'auto'` leva o aviso ao rodapé sem sobrepor o formulário em telas baixas. */
  privacyNote: {
    ...typography.footnote,
    color: colors.textMuted,
    marginTop: 'auto',
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
});
