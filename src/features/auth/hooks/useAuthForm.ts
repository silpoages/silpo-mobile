import { useCallback, useState } from 'react';

import type { Credentials } from '../services/authService';
import { validateEmail, validatePassword } from '../validation/authValidation';

type AuthFormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

type PasswordValidator = (password: string) => string | null;

type UseAuthFormParams = {
  onSubmit: (credentials: Credentials) => Promise<unknown>;
  /** Regra de senha da tela: criação exige tamanho mínimo, login só presença. */
  passwordValidator?: PasswordValidator;
};

/**
 * Estado do formulário de e-mail e senha.
 *
 * Valida no envio, ancora cada mensagem no campo que a originou e limpa o erro
 * assim que o usuário volta a digitar naquele campo.
 */
export function useAuthForm({ onSubmit, passwordValidator = validatePassword }: UseAuthFormParams) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setErrors((currentErrors) => ({ ...currentErrors, email: undefined, form: undefined }));
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setErrors((currentErrors) => ({ ...currentErrors, password: undefined, form: undefined }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const emailError = validateEmail(email);
    const passwordError = passwordValidator(password);

    if (emailError !== null || passwordError !== null) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({ email: email.trim(), password });
    } catch {
      setErrors({ form: 'Não foi possível concluir agora. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, onSubmit, password, passwordValidator]);

  return {
    email,
    password,
    errors,
    isSubmitting,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}
