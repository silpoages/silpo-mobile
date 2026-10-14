import { apiRequest } from '@/services/apiClient';
// aguardando a implementação da rota de reenvio de confirmação no backend, por enquanto a função apenas simula o envio do email.
export async function resendConfirmationEmail(email: string): Promise<void> {
  await apiRequest<{ message: string }>('/auth/resend-confirmation', {
    method: 'POST',
    body: { email },
  });
}
