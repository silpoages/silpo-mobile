import { apiRequest } from '@/services/apiClient';

export async function resendConfirmationEmail(email: string): Promise<void> {
  await apiRequest<{ message: string }>('/auth/resend-confirmation', {
    method: 'POST',
    body: { email },
  });
}
