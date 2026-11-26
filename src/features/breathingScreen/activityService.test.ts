import { ApiError, apiRequest } from '@/services/apiClient';

import {
  createActivitySession,
  DEFAULT_BREATHING_ACTIVITY,
  getBreathingActivity,
} from './activityService';

jest.mock('@/services/apiClient', () => {
  const actual = jest.requireActual('@/services/apiClient');
  return { ...actual, apiRequest: jest.fn() };
});

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

const validDetail = {
  id: 'act-1',
  name: 'Respiração 4-7-8',
  type: 'breathing',
  max_duration_seconds: 120,
  inhale_seconds: 4,
  hold_seconds: 7,
  exhale_seconds: 8,
  repeat_count: 4,
};

function mockListThenDetail(list: unknown, detail: unknown = validDetail) {
  apiRequestMock.mockResolvedValueOnce(list).mockResolvedValueOnce(detail);
}

beforeEach(() => {
  apiRequestMock.mockReset();
});

describe('DEFAULT_BREATHING_ACTIVITY', () => {
  it('segue o padrão 4-7-8 sem id da API', () => {
    expect(DEFAULT_BREATHING_ACTIVITY).toMatchObject({
      id: null,
      inhaleSeconds: 4,
      holdSeconds: 7,
      exhaleSeconds: 8,
      repeatCount: 4,
    });
  });
});

describe('getBreathingActivity', () => {
  it('busca a primeira atividade de respiração e converte o detalhe', async () => {
    mockListThenDetail({
      items: [
        { id: 'med-1', type: 'meditation' },
        null,
        { id: 42, type: 'breathing' },
        { id: 'act/1', type: 'breathing' },
      ],
    });

    await expect(getBreathingActivity('tok')).resolves.toEqual({
      id: 'act-1',
      name: 'Respiração 4-7-8',
      type: 'breathing',
      maxDurationSeconds: 120,
      inhaleSeconds: 4,
      holdSeconds: 7,
      exhaleSeconds: 8,
      repeatCount: 4,
    });

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, '/activities', { token: 'tok' });
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, '/activities/act%2F1', { token: 'tok' });
  });

  it('calcula os ciclos pela duração máxima quando repeat_count é nulo', async () => {
    mockListThenDetail(
      { items: [{ id: 'a', type: 'breathing' }] },
      { ...validDetail, repeat_count: null, max_duration_seconds: 60 },
    );

    await expect(getBreathingActivity(null)).resolves.toMatchObject({ repeatCount: 3 });
  });

  it('usa ao menos um ciclo quando a duração máxima é menor que um ciclo', async () => {
    mockListThenDetail(
      { items: [{ id: 'a', type: 'breathing' }] },
      { ...validDetail, repeat_count: undefined, max_duration_seconds: 5 },
    );

    await expect(getBreathingActivity('t')).resolves.toMatchObject({ repeatCount: 1 });
  });

  it('usa um ciclo quando não há repetição nem duração máxima', async () => {
    mockListThenDetail(
      { items: [{ id: 'a', type: 'breathing' }] },
      { ...validDetail, repeat_count: null, max_duration_seconds: undefined },
    );

    await expect(getBreathingActivity('t')).resolves.toMatchObject({
      repeatCount: 1,
      maxDurationSeconds: null,
    });
  });

  it.each([
    ['nulo', null],
    ['sem items', { foo: [] }],
    ['items não é lista', { items: 'x' }],
    ['string', 'oops'],
  ])('rejeita lista inválida (%s)', async (_label, list) => {
    apiRequestMock.mockResolvedValueOnce(list);

    await expect(getBreathingActivity('t')).rejects.toThrow(
      'A API retornou parâmetros de respiração inválidos.',
    );
  });

  it('avisa quando não há atividade de respiração', async () => {
    apiRequestMock.mockResolvedValueOnce({ items: [{ id: 'x', type: 'meditation' }] });

    await expect(getBreathingActivity('t')).rejects.toThrow(
      'Nenhuma atividade de respiração está disponível.',
    );
  });

  it.each([
    ['nulo', null],
    ['não objeto', 3],
    ['id inválido', { ...validDetail, id: 1 }],
    ['nome inválido', { ...validDetail, name: null }],
    ['tipo errado', { ...validDetail, type: 'meditation' }],
    ['inspiração zero', { ...validDetail, inhale_seconds: 0 }],
    ['pausa fracionada', { ...validDetail, hold_seconds: 1.5 }],
    ['expiração string', { ...validDetail, exhale_seconds: '8' }],
    ['repetição negativa', { ...validDetail, repeat_count: -1 }],
    ['duração inválida', { ...validDetail, max_duration_seconds: 0 }],
  ])('rejeita detalhe inválido (%s)', async (_label, detail) => {
    mockListThenDetail({ items: [{ id: 'a', type: 'breathing' }] }, detail);

    await expect(getBreathingActivity('t')).rejects.toThrow(
      'A API retornou parâmetros de respiração inválidos.',
    );
  });

  it('propaga erros da API', async () => {
    apiRequestMock.mockRejectedValueOnce(new ApiError(401, 'Não autorizado'));

    await expect(getBreathingActivity('t')).rejects.toMatchObject({ status: 401 });
  });
});

describe('createActivitySession', () => {
  it('registra a sessão e converte a resposta', async () => {
    apiRequestMock.mockResolvedValueOnce({
      session_id: 's-1',
      activity_id: 'a 1',
      time_spent_seconds: 76,
      completed_at: '2026-01-01T00:00:00Z',
    });

    await expect(createActivitySession('tok', 'a 1', 76)).resolves.toEqual({
      id: 's-1',
      activityId: 'a 1',
      timeSpentSeconds: 76,
      completedAt: '2026-01-01T00:00:00Z',
    });

    expect(apiRequestMock).toHaveBeenCalledWith('/activities/a%201/sessions', {
      method: 'POST',
      token: 'tok',
      body: { time_spent_seconds: 76 },
    });
  });
});
