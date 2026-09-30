import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthHeader } from '@/features/auth/components/AuthHeader';

import { validateEmail, validateNewPassword } from '@/features/auth/validation/authValidation';
import { colors, layout, spacing, fontSize, fontFamily } from '@/theme';
import EmailForm from '@/components/forgetPasswordScreen/EmailForm';
import VerificationCodeForm from '@/components/forgetPasswordScreen/VerificationCodeForm';
import NewPasswordForm from '@/components/forgetPasswordScreen/NewPasswordForm';
import ChangedPasswordForm from '@/components/forgetPasswordScreen/ChangedPasswordForm';

export default function ForgetPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  function handleBack() {
    if (step > 1) {
      setStep((currentStep) => currentStep - 1);
      return;
    }

    router.back();
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailError(undefined);
  }

  function handleCodeChange(value: string) {
    setCode(value.replace(/[^0-9]/g, '').slice(0, 6));
    setCodeError(undefined);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordError(undefined);
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
      if (code.length !== 6) {
        setCodeError('Digite o código de 6 dígitos.');
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      if (!password) {
        setPasswordError('Digite a nova senha e confirme.');
        return;
      }

      const passwordValidationError = validateNewPassword(password);

      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        return;
      }

      if (!passwordConfirmation) {
        setPasswordError('Preencha a confirmação da senha.');
        return;
      }

      if (password !== passwordConfirmation) {
        setPasswordError('As senhas precisam ser iguais.');
        return;
      }

      setStep(4);
      return;
    }
  }

  const titles = ['Recupere o acesso à sua conta', 'Verifique seu e-mail', 'Crie uma nova senha'];

  const subtitles = [
    'Sem problemas. Digite o e-mail da sua conta para recuperar o acesso.',
    `Digite o código de 6 dígitos enviado para ${email}.`,
    'Crie uma nova senha para voltar a acessar sua conta.',
  ];

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <AuthHeader
          onPressBack={handleBack}
          subtitle={subtitles[step - 1]}
          title={titles[step - 1]}
        />

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
              error={passwordError}
              onChangePassword={handlePasswordChange}
              onChangePasswordConfirmation={setPasswordConfirmation}
              onSubmit={handleSubmit}
              password={password}
              passwordConfirmation={passwordConfirmation}
            />
          ) : (
            <ChangedPasswordForm />
          )}
        </View>
        <View style={{ position: 'absolute', bottom: 20, alignSelf: 'center' }}>
          <Text style={styles.privacyNote}>Seus dados são privados e ficam com você.</Text>
        </View>
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

  privacyNote: {
    color: colors.textMuted,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    textAlign: 'center',
  },

  footer: {
    textAlign: 'center',
  },
});
