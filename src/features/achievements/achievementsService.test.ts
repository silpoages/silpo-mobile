import { apiRequest } from '@/services/apiClient';
import {
  acknowledgeAchievement,
  getAchievements,
  getPendingAchievements,
} from './achievementsService';

jest.mock('@/services/apiClient', () => ({
  ...jest.requireActual('@/services/apiClient'),
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

function rawAchievement(overrides: Record<string, unknown> = {}) {
  return {
    id: 'first-mood',
    name: 'Primeiro registro',
    description: 'Registre uma emoção',
    icon: 'happy-outline',
    category: 'mood',
    unlocked: true,
    progress: { current: 1, target: 1 },
    unlocked_at: '2026-01-02T10:00:00Z',
    ...overrides,
  };
}

const INVALID = 'A API retornou conquistas inválidas.';

describe('achievementsService', () => {
  beforeEach(() => apiRequestMock.mockReset());

  it('getAchievements busca GET /achievements e converte os itens', async () => {
    apiRequestMock.mockResolvedValue({
      items: [
        rawAchievement(),
        rawAchievement({
          id: 'diary-5',
          category: 'diary',
          unlocked: false,
          progress: { current: 2, target: 5 },
          unlocked_at: null,
        }),
      ],
    });

    await expect(getAchievements('tok')).resolves.toEqual([
      {
        id: 'first-mood',
        name: 'Primeiro registro',
        description: 'Registre uma emoção',
        icon: 'happy-outline',
        category: 'mood',
        unlocked: true,
        progress: { current: 1, target: 1 },
        unlockedAt: '2026-01-02T10:00:00Z',
      },
      {
        id: 'diary-5',
        name: 'Primeiro registro',
        description: 'Registre uma emoção',
        icon: 'happy-outline',
        category: 'diary',
        unlocked: false,
        progress: { current: 2, target: 5 },
        unlockedAt: null,
      },
    ]);
    expect(apiRequestMock).toHaveBeenCalledWith('/achievements', { token: 'tok' });
  });

  it('getPendingAchievements busca GET /achievements/pending', async () => {
    apiRequestMock.mockResolvedValue({ items: [] });

    await expect(getPendingAchievements('tok')).resolves.toEqual([]);
    expect(apiRequestMock).toHaveBeenCalledWith('/achievements/pending', { token: 'tok' });
  });

  it('acknowledgeAchievement faz POST com o id codificado', async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await acknowledgeAchievement('tok', 'a b/c');

    expect(apiRequestMock).toHaveBeenCalledWith('/achievements/a%20b%2Fc/acknowledge', {
      method: 'POST',
      token: 'tok',
    });
  });

  it.each([
    ['resposta nula', null],
    ['sem items', {}],
    ['items não-lista', { items: 'x' }],
    ['item nulo', { items: [null] }],
    ['sem progress', { items: [rawAchievement({ progress: null })] }],
    ['id inválido', { items: [rawAchievement({ id: 1 })] }],
    ['name inválido', { items: [rawAchievement({ name: null })] }],
    ['description inválida', { items: [rawAchievement({ description: 3 })] }],
    ['icon inválido', { items: [rawAchievement({ icon: undefined })] }],
    ['category não-string', { items: [rawAchievement({ category: 5 })] }],
    ['category desconhecida', { items: [rawAchievement({ category: 'sleep' })] }],
    ['unlocked inválido', { items: [rawAchievement({ unlocked: 'yes' })] }],
    [
      'progress.current inválido',
      { items: [rawAchievement({ progress: { current: -1, target: 1 } })] },
    ],
    [
      'progress.target inválido',
      { items: [rawAchievement({ progress: { current: 1, target: 0.5 } })] },
    ],
    ['unlocked_at inválido', { items: [rawAchievement({ unlocked_at: 123 })] }],
  ])('rejeita %s', async (_label, response) => {
    apiRequestMock.mockResolvedValue(response);

    await expect(getAchievements('tok')).rejects.toThrow(INVALID);
  });
});
