import { apiRequest } from '@/services/apiClient';
import { getJourney } from './journeyService';

jest.mock('@/services/apiClient', () => ({
  ...jest.requireActual('@/services/apiClient'),
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

function validResponse(overrides: Record<string, unknown> = {}) {
  return {
    summary: { mood_days: 4, different_good_practices: 2, completed_activities: 7 },
    mood_distribution: [
      { mood: 'FELIZ', count: 3 },
      { mood: 'TRISTE', count: 1 },
    ],
    achievements: { unlocked: 2, total: 10 },
    ...overrides,
  };
}

const INVALID = 'A API retornou um resumo de jornada inválido.';

describe('getJourney', () => {
  beforeEach(() => apiRequestMock.mockReset());

  it('chama GET /journey com o token e converte a resposta', async () => {
    apiRequestMock.mockResolvedValue(validResponse());

    await expect(getJourney('tok')).resolves.toEqual({
      daysRegistered: 4,
      practicesTried: 2,
      exercisesCompleted: 7,
      moodCounts: { FELIZ: 3, TRISTE: 1 },
      achievements: { unlocked: 2, total: 10 },
    });
    expect(apiRequestMock).toHaveBeenCalledWith('/journey', { token: 'tok' });
  });

  it('ignora emoções desconhecidas na distribuição', async () => {
    apiRequestMock.mockResolvedValue(
      validResponse({ mood_distribution: [{ mood: 'EUFORICO', count: 9 }] }),
    );

    await expect(getJourney('tok')).resolves.toMatchObject({ moodCounts: {} });
  });

  it.each([
    ['resposta nula', null],
    ['resposta não-objeto', 'oops'],
    ['sem summary', { ...validResponse(), summary: undefined }],
    ['sem achievements', { ...validResponse(), achievements: null }],
    ['distribuição não-lista', validResponse({ mood_distribution: {} })],
    [
      'contagem negativa no resumo',
      validResponse({
        summary: { mood_days: -1, different_good_practices: 0, completed_activities: 0 },
      }),
    ],
    [
      'contagem fracionária no resumo',
      validResponse({
        summary: { mood_days: 1, different_good_practices: 1.5, completed_activities: 0 },
      }),
    ],
    [
      'completed_activities ausente',
      validResponse({ summary: { mood_days: 1, different_good_practices: 1 } }),
    ],
    ['unlocked inválido', validResponse({ achievements: { unlocked: '1', total: 2 } })],
    ['total inválido', validResponse({ achievements: { unlocked: 1 } })],
    ['item da distribuição nulo', validResponse({ mood_distribution: [null] })],
    ['mood não-string', validResponse({ mood_distribution: [{ mood: 1, count: 1 }] })],
    ['count inválido', validResponse({ mood_distribution: [{ mood: 'BEM', count: -2 }] })],
  ])('rejeita %s', async (_label, response) => {
    apiRequestMock.mockResolvedValue(response);

    await expect(getJourney('tok')).rejects.toThrow(INVALID);
  });

  it('propaga erros da API', async () => {
    apiRequestMock.mockRejectedValue(new Error('rede'));

    await expect(getJourney('tok')).rejects.toThrow('rede');
  });
});
