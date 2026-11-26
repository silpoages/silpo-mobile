import { apiRequest } from '@/services/apiClient';
import { createMoodLog, getTodayMoodLog } from '@/components/emotions/moodLogService';

jest.mock('@/services/apiClient', () => ({ apiRequest: jest.fn() }));

const mockApiRequest = jest.mocked(apiRequest);

const apiLog = { id: 'm1', user_id: 'u1', mood: 'FELIZ', posted_at: '2026-01-01T10:00:00Z' };

describe('moodLogService', () => {
  it('busca o registro de hoje', async () => {
    mockApiRequest.mockResolvedValueOnce(apiLog);

    await expect(getTodayMoodLog('tok')).resolves.toEqual({
      id: 'm1',
      mood: 'FELIZ',
      postedAt: '2026-01-01T10:00:00Z',
    });
    expect(mockApiRequest).toHaveBeenCalledWith('/mood-logs/today', { token: 'tok' });
  });

  it('retorna null quando não há registro hoje', async () => {
    mockApiRequest.mockResolvedValueOnce(null);

    await expect(getTodayMoodLog('tok')).resolves.toBeNull();
  });

  it('cria um registro', async () => {
    mockApiRequest.mockResolvedValueOnce(apiLog);

    await expect(createMoodLog('tok', 'FELIZ')).resolves.toMatchObject({ mood: 'FELIZ' });
    expect(mockApiRequest).toHaveBeenCalledWith('/mood-logs', {
      method: 'POST',
      token: 'tok',
      body: { mood: 'FELIZ' },
    });
  });
});
