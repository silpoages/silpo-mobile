import {
  requestPasswordResetCode,
  resetPasswordWithCode,
  verifyPasswordResetCode,
} from '@/features/auth/services/passwordResetService';
import { apiRequest } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  ...jest.requireActual('@/services/apiClient'),
  apiRequest: jest.fn(),
}));

const mockedApiRequest = jest.mocked(apiRequest);

beforeEach(() => {
  mockedApiRequest.mockReset();
});

describe('passwordResetService', () => {
  beforeEach(() => {
    mockedApiRequest.mockResolvedValue({ message: 'ok' });
  });

  it('pede o código por e-mail', async () => {
    await requestPasswordResetCode('ana@silpo.com');

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/forgot-password', {
      method: 'POST',
      body: { email: 'ana@silpo.com', method: 'CODE' },
    });
  });

  it('confere o código', async () => {
    await verifyPasswordResetCode('ana@silpo.com', '123456');

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/reset-password-code/verify', {
      method: 'POST',
      body: { email: 'ana@silpo.com', code: '123456' },
    });
  });

  it('redefine a senha com o código', async () => {
    await resetPasswordWithCode('ana@silpo.com', '123456', 'novaSenha1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/reset-password-code', {
      method: 'POST',
      body: { email: 'ana@silpo.com', code: '123456', new_password: 'novaSenha1' },
    });
  });
});
