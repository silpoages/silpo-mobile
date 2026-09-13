import { apiRequest } from '@/services/apiClient';
import type { SessionUser } from '@/features/auth/session/SessionContext';

export type Credentials = {
  email: string;
  password: string;
};

export type SignInResult = {
  token: string;
  user: SessionUser;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    onboarding_completed: boolean;
  };
};

const GOOGLE_SIGN_IN_SIMULATED_LATENCY_MS = 900;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** Autentica uma conta existente via `POST /auth/login`. */
export async function signIn({ email, password }: Credentials): Promise<SignInResult> {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  return {
    token: response.access_token,
    user: {
      id: response.user.id,
      email: response.user.email,
      fullName: response.user.full_name,
      role: response.user.role,
      onboardingCompleted: response.user.onboarding_completed,
    },
  };
}

/**
 * Autentica pela conta Google do dispositivo.
 *
 * Ainda simulado: o backend não expõe login social.
 */
export async function signInWithGoogle(): Promise<void> {
  await delay(GOOGLE_SIGN_IN_SIMULATED_LATENCY_MS);
}
