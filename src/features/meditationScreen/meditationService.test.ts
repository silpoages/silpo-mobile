import { createActivitySession } from '@/features/breathingScreen/activityService';
import { apiRequest } from '@/services/apiClient';

import { listMeditations, registerMeditationSession } from './meditationService';

jest.mock('@/services/apiClient', () => ({ apiRequest: jest.fn() }));
jest.mock('@/features/breathingScreen/activityService', () => ({
  createActivitySession: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;
const createSessionMock = createActivitySession as jest.MockedFunction<
  typeof createActivitySession
>;

beforeEach(() => {
  apiRequestMock.mockReset();
  createSessionMock.mockReset();
});

describe('listMeditations', () => {
  it('lista só meditações e busca o detalhe (com áudio) de cada uma', async () => {
    apiRequestMock.mockImplementation(async (path: string) => {
      if (path === '/activities') {
        return {
          items: [
            { id: 'm 1', name: 'A', type: 'meditation', max_duration_seconds: 300 },
            { id: 'b1', name: 'B', type: 'breathing', max_duration_seconds: 120 },
            { id: 'm2', name: 'C', type: 'meditation', max_duration_seconds: null },
          ],
        };
      }
      if (path === '/activities/m%201') {
        return {
          id: 'm 1',
          name: 'Calma',
          type: 'meditation',
          max_duration_seconds: 300,
          audio_url: 'https://audio/1.mp3',
          description: '  Respire.  ',
        };
      }
      return {
        id: 'm2',
        name: 'Foco',
        type: 'meditation',
        max_duration_seconds: null,
        audio_url: 'https://audio/2.mp3',
      };
    });

    await expect(listMeditations('tok')).resolves.toEqual([
      {
        id: 'm 1',
        title: 'Calma',
        description: 'Respire.',
        durationSeconds: 300,
        audioUrl: 'https://audio/1.mp3',
      },
      {
        id: 'm2',
        title: 'Foco',
        description: '',
        durationSeconds: null,
        audioUrl: 'https://audio/2.mp3',
      },
    ]);

    expect(apiRequestMock).toHaveBeenCalledWith('/activities', { token: 'tok' });
    expect(apiRequestMock).toHaveBeenCalledWith('/activities/m%201', { token: 'tok' });
    expect(apiRequestMock).toHaveBeenCalledWith('/activities/m2', { token: 'tok' });
    expect(apiRequestMock).toHaveBeenCalledTimes(3);
  });

  it('devolve lista vazia quando não há meditações', async () => {
    apiRequestMock.mockResolvedValueOnce({ items: [] });

    await expect(listMeditations('tok')).resolves.toEqual([]);
    expect(apiRequestMock).toHaveBeenCalledTimes(1);
  });
});

describe('registerMeditationSession', () => {
  it('delega para createActivitySession', async () => {
    createSessionMock.mockResolvedValueOnce({
      id: 's',
      activityId: 'm1',
      timeSpentSeconds: 30,
      completedAt: 'x',
    });

    await expect(registerMeditationSession('tok', 'm1', 30)).resolves.toBeUndefined();
    expect(createSessionMock).toHaveBeenCalledWith('tok', 'm1', 30);
  });
});
