import { register, signIn, signInWithGoogle } from '@/features/auth/services/authService';
import { apiRequest } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  ...jest.requireActual('@/services/apiClient'),
  apiRequest: jest.fn(),
}));

const mockedApiRequest = jest.mocked(apiRequest);

beforeEach(() => {
  mockedApiRequest.mockReset();
});

function loginResponse(emailConfirmedAt: string | null | undefined) {
  return {
    access_token: 'tok-123',
    token_type: 'bearer',
    user: {
      id: 'u1',
      email: 'ana@silpo.com',
      full_name: 'Ana',
      role: 'USER',
      onboarding_completed: true,
      email_confirmed_at: emailConfirmedAt,
    },
  };
}

describe('signIn', () => {
  it('autentica e converte a resposta para a sessão', async () => {
    mockedApiRequest.mockResolvedValueOnce(loginResponse('2026-01-01T00:00:00Z'));

    const result = await signIn({ email: 'ana@silpo.com', password: 'segredo' });

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'ana@silpo.com', password: 'segredo' },
    });
    expect(result).toEqual({
      token: 'tok-123',
      user: {
        id: 'u1',
        email: 'ana@silpo.com',
        fullName: 'Ana',
        role: 'USER',
        onboardingCompleted: true,
      },
      isEmailConfirmed: true,
    });
  });

  it('marca o e-mail como não confirmado quando email_confirmed_at é null', async () => {
    mockedApiRequest.mockResolvedValueOnce(loginResponse(null));

    const result = await signIn({ email: 'ana@silpo.com', password: 'segredo' });

    expect(result.isEmailConfirmed).toBe(false);
  });

  it('considera confirmado quando o backend não manda o campo', async () => {
    mockedApiRequest.mockResolvedValueOnce(loginResponse(undefined));

    const result = await signIn({ email: 'ana@silpo.com', password: 'segredo' });

    expect(result.isEmailConfirmed).toBe(true);
  });
});

describe('register', () => {
  it('cadastra e em seguida faz login com as mesmas credenciais', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({ id: 'u1', email: 'ana@silpo.com', role: 'USER' })
      .mockResolvedValueOnce(loginResponse('2026-01-01T00:00:00Z'));

    const result = await register({ email: 'ana@silpo.com', password: 'segredo123' });

    expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/auth/register', {
      method: 'POST',
      body: { email: 'ana@silpo.com', password: 'segredo123' },
    });
    expect(mockedApiRequest).toHaveBeenNthCalledWith(2, '/auth/login', {
      method: 'POST',
      body: { email: 'ana@silpo.com', password: 'segredo123' },
    });
    expect(result.token).toBe('tok-123');
  });

  it('não tenta logar se o cadastro falhar', async () => {
    mockedApiRequest.mockRejectedValueOnce(new Error('409'));

    await expect(register({ email: 'ana@silpo.com', password: 'segredo123' })).rejects.toThrow(
      '409',
    );
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });
});

describe('signInWithGoogle', () => {
  it('resolve depois da latência simulada', async () => {
    jest.useFakeTimers();
    try {
      const onDone = jest.fn();
      const promise = signInWithGoogle().then(onDone);

      await jest.advanceTimersByTimeAsync(899);
      expect(onDone).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(1);
      await promise;
      expect(onDone).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
