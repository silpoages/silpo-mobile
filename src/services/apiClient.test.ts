import { API_BASE_URL, ApiError, apiRequest } from '@/services/apiClient';

function mockFetchResponse(init: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json?: () => Promise<unknown>;
}) {
  const response = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? '',
    json: init.json ?? (() => Promise.resolve({})),
  };
  const fetchMock = jest.fn().mockResolvedValue(response);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('apiRequest', () => {
  it('usa a URL da variável de ambiente', () => {
    expect(API_BASE_URL).toBe('http://api.test');
  });

  it('faz GET por padrão, sem corpo nem Authorization', async () => {
    const fetchMock = mockFetchResponse({ json: () => Promise.resolve({ ok: 1 }) });

    await expect(apiRequest('/ping')).resolves.toEqual({ ok: 1 });

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/ping', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined,
    });
  });

  it('envia JSON e Bearer token quando informados', async () => {
    const fetchMock = mockFetchResponse({ json: () => Promise.resolve({ id: 1 }) });

    await apiRequest('/items', { method: 'POST', body: { a: 1 }, token: 'tok' });

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/items', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer tok',
      },
      body: JSON.stringify({ a: 1 }),
    });
  });

  it('retorna undefined para 204', async () => {
    const json = jest.fn();
    mockFetchResponse({ status: 204, json });

    await expect(apiRequest('/x', { method: 'DELETE' })).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it('lança ApiError com o detail do FastAPI', async () => {
    mockFetchResponse({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'Inválido' }),
    });

    const error = await apiRequest('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, message: 'Inválido' });
  });

  it('usa o statusText quando detail não é string', async () => {
    mockFetchResponse({
      ok: false,
      status: 422,
      statusText: 'Unprocessable',
      json: () => Promise.resolve({ detail: [{ msg: 'x' }] }),
    });

    await expect(apiRequest('/x')).rejects.toMatchObject({ status: 422, message: 'Unprocessable' });
  });

  it('usa mensagem padrão quando o corpo não é JSON e não há statusText', async () => {
    mockFetchResponse({
      ok: false,
      status: 500,
      json: () => Promise.reject(new SyntaxError('bad json')),
    });

    await expect(apiRequest('/x')).rejects.toMatchObject({
      status: 500,
      message: 'Erro inesperado',
    });
  });
});
