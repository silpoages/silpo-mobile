import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from '@/components/Button';
import { TextField } from '@/components/TextField';
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter';
import { spacing } from '@/theme';

const CODE_EXPIRATION_SECONDS = 60;

type VerificationCodeFormProps = {
  code: string;
  error?: string;
  onChangeCode: (value: string) => void;
  onSubmit: () => void;
};

export default function VerificationCodeForm({
  code,
  error,
  onChangeCode,
  onSubmit,
}: VerificationCodeFormProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(CODE_EXPIRATION_SECONDS);

  useEffect(() => {
    let currentSeconds = CODE_EXPIRATION_SECONDS;

    const timer = setInterval(() => {
      currentSeconds -= 1;
      setSecondsRemaining(currentSeconds);

      if (currentSeconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function handleResendCode() {
    // Implementar depois

    setSecondsRemaining(CODE_EXPIRATION_SECONDS);
  }

  const resendCodeLabel =
    secondsRemaining > 0 ? `Reenviar código em ${secondsRemaining}s` : 'Enviar código';

  return (
    <View style={styles.container}>
      <TextField
        errorMessage={error}
        keyboardType="number-pad"
        label="Código de verificação"
        onChangeText={onChangeCode}
        onSubmitEditing={onSubmit}
        placeholder="000000"
        returnKeyType="go"
        testID="code-field"
        value={code}
      />

      <Button onPress={onSubmit} size="lg" testID="submit-button">
        Verificar código
      </Button>

      <View style={styles.footer}>
        <AuthFormFooter
          actionLabel={resendCodeLabel}
          onPressAction={() => {
            if (secondsRemaining > 0) return;

            handleResendCode();
          }}
          question="Não recebeu?"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  footer: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timer: {
    color: '#777777',
  },
});
