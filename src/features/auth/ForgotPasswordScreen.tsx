import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/ScreenContainer';
import ChangedPasswordForm from '@/components/forgotPasswordScreen/ChangedPasswordForm';
import EmailForm from '@/components/forgotPasswordScreen/EmailForm';
import NewPasswordForm from '@/components/forgotPasswordScreen/NewPasswordForm';
import VerificationCodeForm from '@/components/forgotPasswordScreen/VerificationCodeForm';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import {
  requestPasswordResetCode,
  resetPasswordWithCode,
  verifyPasswordResetCode,
} from '@/features/auth/services/passwordResetService';
import { validateEmail, validateNewPassword } from '@/features/auth/validation/authValidation';
import { ApiError } from '@/services/apiClient';
import { colors, layout, spacing, typography } from '@/theme';

const CODE_LENGTH = 6;

/** O backend responde 400 para código errado, expirado, já usado ou com tentativas esgotadas. */
function isInvalidCode(error: unknown) {
  return error instanceof ApiError && error.status === 400;
}

/**
 * Recuperação de senha em 4 etapas: e-mail, código, nova senha e confirmação.
 *
 * O código chega por e-mail (`POST /auth/forgot-password` com `method: 'CODE'`) e é
 * conferido junto com o e-mail; o backend só aceita poucas tentativas erradas por código.
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /** Envia (ou reenvia) o código para o e-mail informado. */
  async function sendCode(): Promise<boolean> {
    try {
      await requestPasswordResetCode(email.trim());
      return true;
    } catch {
      return false;
    }
  }

  async function handleResendCode() {
    setCodeError(undefined);
    const sent = await sendCode();

    if (!sent) {
      setCodeError('Não foi possível reenviar o código. Tente novamente.');
    }

    return sent;
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitStep();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitStep() {
    if (step === 1) {
      const error = validateEmail(email);

      if (error) {
        setEmailError(error);
        return;
      }

      if (!(await sendCode())) {
        setEmailError('Não foi possível enviar o código. Tente novamente.');
        return;
      }

      setCode('');
      setStep(2);
      return;
    }

    if (step === 2) {
      if (code.length !== CODE_LENGTH) {
        setCodeError(`Digite o código de ${CODE_LENGTH} dígitos.`);
        return;
      }

      try {
        await verifyPasswordResetCode(email.trim(), code);
      } catch (error) {
        setCodeError(
          isInvalidCode(error)
            ? 'Código inválido ou expirado.'
            : 'Não foi possível verificar o código. Tente novamente.',
        );
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

    try {
      await resetPasswordWithCode(email.trim(), code, password);
    } catch (error) {
      if (isInvalidCode(error)) {
        // O código expirou ou foi usado entre a verificação e o envio da nova senha.
        setCode('');
        setStep(2);
        setCodeError('Seu código expirou. Toque em "Reenviar código" para receber outro.');
        return;
      }

      setConfirmationError('Não foi possível redefinir a senha. Tente novamente.');
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
              isSubmitting={isSubmitting}
              onChangeEmail={handleEmailChange}
              onSubmit={handleSubmit}
            />
          ) : step === 2 ? (
            <VerificationCodeForm
              code={code}
              error={codeError}
              isSubmitting={isSubmitting}
              onChangeCode={handleCodeChange}
              onResendCode={handleResendCode}
              onSubmit={handleSubmit}
            />
          ) : step === 3 ? (
            <NewPasswordForm
              confirmationError={confirmationError}
              isSubmitting={isSubmitting}
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
