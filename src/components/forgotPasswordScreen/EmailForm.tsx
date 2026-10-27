import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import Button from '@/components/Button';
import { TextField } from '@/components/TextField';
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter';

type EmailFormProps = {
  email: string;
  error?: string;
  isSubmitting?: boolean;
  onChangeEmail: (value: string) => void;
  onSubmit: () => void;
};

export default function EmailForm({
  email,
  error,
  isSubmitting = false,
  onChangeEmail,
  onSubmit,
}: EmailFormProps) {
  const router = useRouter();

  return (
    <>
      <TextField
        autoComplete="email"
        errorMessage={error}
        keyboardType="email-address"
        label="E-mail"
        onChangeText={onChangeEmail}
        onSubmitEditing={onSubmit}
        placeholder="seu@email.com"
        returnKeyType="go"
        testID="email-field"
        textContentType="emailAddress"
        value={email}
      />

      <Button loading={isSubmitting} onPress={onSubmit} size="lg" testID="submit-button">
        Enviar código
      </Button>

      <View style={styles.footer}>
        <AuthFormFooter
          actionLabel="Entrar"
          onPressAction={() => router.dismissTo('/login')}
          question="Lembrou a senha?"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignSelf: 'center',
  },
});
