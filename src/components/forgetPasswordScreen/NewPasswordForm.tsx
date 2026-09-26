import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '@/components/Button';
import { TextField } from '@/components/TextField';
import { spacing } from '@/theme';

type NewPasswordFormProps = {
  password: string;
  passwordConfirmation: string;
  error?: string;
  onChangePassword: (value: string) => void;
  onChangePasswordConfirmation: (value: string) => void;
  onSubmit: () => void;
};

export default function NewPasswordForm({
  password,
  passwordConfirmation,
  error,
  onChangePassword,
  onChangePasswordConfirmation,
  onSubmit,
}: NewPasswordFormProps) {
  const [confirmationError, setConfirmationError] = useState('');

  function handleSubmit() {
    if (password && !passwordConfirmation) {
      setConfirmationError('Confirme sua nova senha.');
      return;
    }

    if (password !== passwordConfirmation) {
      setConfirmationError('As senhas não coincidem.');
      return;
    }

    if (password === passwordConfirmation) {
      onSubmit();
    }
  }

  return (
    <>
      <View style={styles.fields}>
        <TextField
          autoComplete="new-password"
          errorMessage={error}
          label="Nova senha"
          onChangeText={(value) => {
            setConfirmationError('');
            onChangePassword(value);
          }}
          placeholder="mínimo de 8 caracteres"
          secureTextEntry
          textContentType="newPassword"
          value={password}
        />
        <TextField
          autoComplete="new-password"
          errorMessage={confirmationError || undefined}
          label="Confirme a nova senha"
          onChangeText={(value) => {
            setConfirmationError('');
            onChangePasswordConfirmation(value);
          }}
          onSubmitEditing={handleSubmit}
          placeholder="repita sua senha"
          returnKeyType="go"
          secureTextEntry
          textContentType="newPassword"
          value={passwordConfirmation}
        />
      </View>

      <Button onPress={handleSubmit} size="lg" testID="submit-button">
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
