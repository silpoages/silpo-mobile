import { resendConfirmationEmail } from '@/features/emailConfirmationScreen/emailConfirmationService';
import { apiRequest } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  ...jest.requireActual('@/services/apiClient'),
  apiRequest: jest.fn(),
}));

const mockedApiRequest = jest.mocked(apiRequest);

beforeEach(() => {
  mockedApiRequest.mockReset();
});

describe('resendConfirmationEmail', () => {
  it('pede o reenvio do link para o e-mail', async () => {
    mockedApiRequest.mockResolvedValueOnce({ message: 'ok' });

    await expect(resendConfirmationEmail('ana@silpo.com')).resolves.toBeUndefined();

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/resend-confirmation', {
      method: 'POST',
      body: { email: 'ana@silpo.com' },
    });
  });

  it('propaga o erro da API', async () => {
    mockedApiRequest.mockRejectedValueOnce(new Error('falhou'));

    await expect(resendConfirmationEmail('ana@silpo.com')).rejects.toThrow('falhou');
  });
});
