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
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [codigoError, setCodigoError] = useState<string>();
  const [senhaError, setSenhaError] = useState<string>();

  function handleBack() {
    if (etapa > 1) {
      setEtapa((currentEtapa) => currentEtapa - 1);
      return;
    }

    router.back();
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailError(undefined);
  }

  function handleCodigoChange(value: string) {
    setCodigo(value.replace(/[^0-9]/g, '').slice(0, 6));
    setCodigoError(undefined);
  }

  function handleSenhaChange(value: string) {
    setSenha(value);
    setSenhaError(undefined);
  }

  function handleSubmit() {
    if (etapa === 1) {
      const error = validateEmail(email);

      if (error) {
        setEmailError(error);
        return;
      }

      setEtapa(2);
      return;
    }

    if (etapa === 2) {
      if (codigo.length !== 6) {
        setCodigoError('Digite o código de 6 dígitos.');
        return;
      }

      setEtapa(3);
      return;
    }

    if (etapa === 3) {
      if (!senha) {
        setSenhaError('Digite a nova senha e confirme.');
        return;
      }

      if (!confirmacaoSenha) {
        setSenhaError('Preencha a confirmação da senha.');
        return;
      }

      setEtapa(4);
      return;
    }

    const error = validateNewPassword(senha);

    if (error) {
      setSenhaError(error);
      return;
    }

    if (senha !== confirmacaoSenha) {
      setSenhaError('As senhas precisam ser iguais.');
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
          subtitle={subtitles[etapa - 1]}
          title={titles[etapa - 1]}
        />

        <View style={styles.form}>
          {etapa === 1 ? (
            <EmailForm
              email={email}
              error={emailError}
              onChangeEmail={handleEmailChange}
              onSubmit={handleSubmit}
            />
          ) : etapa === 2 ? (
            <VerificationCodeForm
              code={codigo}
              error={codigoError}
              onChangeCode={handleCodigoChange}
              onSubmit={handleSubmit}
            />
          ) : etapa === 3 ? (
            <NewPasswordForm
              error={senhaError}
              onChangePassword={handleSenhaChange}
              onChangePasswordConfirmation={setConfirmacaoSenha}
              onSubmit={handleSubmit}
              password={senha}
              passwordConfirmation={confirmacaoSenha}
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
