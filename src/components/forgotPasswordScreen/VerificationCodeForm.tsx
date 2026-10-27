import { StyleSheet, View } from 'react-native';

import Button from '@/components/Button';
import { TextField } from '@/components/TextField';
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter';
import { useResendCooldown } from '@/features/emailConfirmationScreen/useResendCooldown';
import { spacing } from '@/theme';

const RESEND_COOLDOWN_SECONDS = 60;

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
  const { secondsLeft, isCoolingDown, restart } = useResendCooldown(RESEND_COOLDOWN_SECONDS);

  function handleResendCode() {
    if (isCoolingDown) {
      return;
    }

    // Implementar o reenvio quando o fluxo for integrado ao backend.
    restart();
  }

  return (
    <View style={styles.container}>
      <TextField
        autoComplete="one-time-code"
        errorMessage={error}
        keyboardType="number-pad"
        label="Código de verificação"
        onChangeText={onChangeCode}
        onSubmitEditing={onSubmit}
        placeholder="000000"
        returnKeyType="go"
        testID="code-field"
        textContentType="oneTimeCode"
        value={code}
      />

      <Button onPress={onSubmit} size="lg" testID="submit-button">
        Verificar código
      </Button>

      <View style={styles.footer}>
        <AuthFormFooter
          actionLabel={isCoolingDown ? `Reenviar código em ${secondsLeft}s` : 'Reenviar código'}
          onPressAction={handleResendCode}
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
  },
});
