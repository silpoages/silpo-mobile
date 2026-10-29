import { apiRequest } from '@/services/apiClient';
// Reenvia o link de confirmação. O backend responde igual para qualquer e-mail e ignora pedidos repetidos em menos de 30 s.
export async function resendConfirmationEmail(email: string): Promise<void> {
  await apiRequest<{ message: string }>('/auth/resend-confirmation', {
    method: 'POST',
    body: { email },
  });
}
