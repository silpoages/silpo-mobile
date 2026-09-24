import { useCallback, useState } from 'react';

import { ApiError } from '@/services/apiClient';
import type { Credentials } from '@/features/auth/services/authService';
import {
  validateEmail,
  validatePassword as validateLoginPassword,
} from '@/features/auth/validation/authValidation';

type AuthFormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const GENERIC_ERROR_MESSAGE = 'Não foi possível concluir agora. Tente novamente.';

type UseAuthFormParams = {
  onSubmit: (credentials: Credentials) => Promise<unknown>;
  /** Regra de senha a validar no envio; por padrão, a do login (só não-vazia). */
  validatePassword?: (password: string) => string | null;
};

/**
 * Estado do formulário de e-mail e senha.
 *
 * Valida no envio, ancora cada mensagem no campo que a originou e limpa o erro
 * assim que o usuário volta a digitar naquele campo.
 */
export function useAuthForm({
  onSubmit,
  validatePassword = validateLoginPassword,
}: UseAuthFormParams) {
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
    const passwordError = validatePassword(password);

    if (emailError !== null || passwordError !== null) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({ email: email.trim(), password });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE;
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, onSubmit, password, validatePassword]);

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
