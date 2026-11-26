import {
  clearPendingConfirmation,
  getPendingConfirmation,
  isEmailNotConfirmedError,
  setPendingConfirmation,
} from '@/features/emailConfirmationScreen/pendingConfirmation';
import { ApiError } from '@/services/apiClient';

describe('pendingConfirmation', () => {
  afterEach(() => clearPendingConfirmation());

  it('guarda, devolve e limpa as credenciais pendentes', () => {
    expect(getPendingConfirmation()).toBeNull();

    setPendingConfirmation({ email: 'ana@silpo.com', password: 'segredo123' });
    expect(getPendingConfirmation()).toEqual({ email: 'ana@silpo.com', password: 'segredo123' });

    clearPendingConfirmation();
    expect(getPendingConfirmation()).toBeNull();
  });

  it('reconhece só o 403 da API como e-mail não confirmado', () => {
    expect(isEmailNotConfirmedError(new ApiError(403, 'x'))).toBe(true);
    expect(isEmailNotConfirmedError(new ApiError(401, 'x'))).toBe(false);
    expect(isEmailNotConfirmedError(new Error('403'))).toBe(false);
    expect(isEmailNotConfirmedError(undefined)).toBe(false);
  });
});
