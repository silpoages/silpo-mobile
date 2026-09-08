/**
 * Camada de autenticação do app.
 *
 * Implementação provisória: o `silpo-backend` ainda não expõe rotas de
 * autenticação (hoje só existe o módulo de exemplo `Template`). As funções
 * simulam a latência da rede para exercitar os estados de carregamento e erro
 * da interface; quando a rota existir, trocar o corpo delas pela chamada HTTP
 * usando a base de API vinda de variável de ambiente.
 */

export type Credentials = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  email: string;
};

const SIMULATED_LATENCY_MS = 900;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** Cria uma conta com e-mail e senha. */
export async function signUp({ email }: Credentials): Promise<AuthenticatedUser> {
  await delay(SIMULATED_LATENCY_MS);

  return { email: email.trim() };
}

/** Autentica uma conta existente. */
export async function signIn({ email }: Credentials): Promise<AuthenticatedUser> {
  await delay(SIMULATED_LATENCY_MS);

  return { email: email.trim() };
}

/** Autentica pela conta Google do dispositivo. */
export async function signInWithGoogle(): Promise<void> {
  await delay(SIMULATED_LATENCY_MS);
}
