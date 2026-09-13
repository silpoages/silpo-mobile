const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

/** Extrai uma mensagem legível do corpo de erro padrão do FastAPI (`{ detail }`). */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };
    if (typeof data.detail === 'string') {
      return data.detail;
    }
  } catch {
    // corpo não é JSON (ou vazio) — usa o texto de status como mensagem
  }

  return response.statusText || 'Erro inesperado';
}

/** Chamada HTTP fina contra o `silpo-backend`, com JSON e Bearer token opcional. */
export async function apiRequest<TResponse>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<TResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
