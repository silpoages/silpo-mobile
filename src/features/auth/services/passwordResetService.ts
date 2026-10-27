import { apiRequest } from '@/services/apiClient';

type MessageResponse = {
  message: string;
};

/**
 * Pede o código de 6 dígitos por e-mail.
 *
 * O backend responde igual para e-mails sem conta, então sucesso aqui não garante
 * que algum e-mail foi enviado.
 */
export async function requestPasswordResetCode(email: string): Promise<void> {
  await apiRequest<MessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: { email, method: 'CODE' },
  });
}

/** Confere o código antes de pedir a nova senha. Código errado responde 400. */
export async function verifyPasswordResetCode(email: string, code: string): Promise<void> {
  await apiRequest<MessageResponse>('/auth/reset-password-code/verify', {
    method: 'POST',
    body: { email, code },
  });
}

export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await apiRequest<MessageResponse>('/auth/reset-password-code', {
    method: 'POST',
    body: { email, code, new_password: newPassword },
  });
}
