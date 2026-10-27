import { StyleSheet, View } from 'react-native';
import Button from '@/components/Button';
import { TextField } from '@/components/TextField';
import { spacing } from '@/theme';

type NewPasswordFormProps = {
  password: string;
  passwordConfirmation: string;
  passwordError?: string;
  confirmationError?: string;
  isSubmitting?: boolean;
  onChangePassword: (value: string) => void;
  onChangePasswordConfirmation: (value: string) => void;
  onSubmit: () => void;
};

export default function NewPasswordForm({
  password,
  passwordConfirmation,
  passwordError,
  confirmationError,
  isSubmitting = false,
  onChangePassword,
  onChangePasswordConfirmation,
  onSubmit,
}: NewPasswordFormProps) {
  return (
    <>
      <View style={styles.fields}>
        <TextField
          autoComplete="new-password"
          errorMessage={passwordError}
          label="Nova senha"
          onChangeText={onChangePassword}
          placeholder="mínimo de 8 caracteres"
          returnKeyType="next"
          secureTextEntry
          testID="new-password-field"
          textContentType="newPassword"
          value={password}
        />
        <TextField
          autoComplete="new-password"
          errorMessage={confirmationError}
          label="Confirme a nova senha"
          onChangeText={onChangePasswordConfirmation}
          onSubmitEditing={onSubmit}
          placeholder="repita sua senha"
          returnKeyType="go"
          secureTextEntry
          testID="password-confirmation-field"
          textContentType="newPassword"
          value={passwordConfirmation}
        />
      </View>

      <Button loading={isSubmitting} onPress={onSubmit} size="lg" testID="submit-button">
        Redefinir senha
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.xl,
  },
});
