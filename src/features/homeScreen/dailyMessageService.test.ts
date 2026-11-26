import { apiRequest } from '@/services/apiClient';
import { getTodayDailyMessage } from '@/features/homeScreen/dailyMessageService';

jest.mock('@/services/apiClient', () => ({ apiRequest: jest.fn() }));

const mockApiRequest = jest.mocked(apiRequest);

describe('getTodayDailyMessage', () => {
  it('retorna a mensagem sem espaços nas pontas', async () => {
    mockApiRequest.mockResolvedValueOnce({ id: '1', message: '  Olá!  ' });

    await expect(getTodayDailyMessage('tok')).resolves.toBe('Olá!');
    expect(mockApiRequest).toHaveBeenCalledWith('/daily-messages/today', { token: 'tok' });
  });

  it('retorna null para mensagem vazia', async () => {
    mockApiRequest.mockResolvedValueOnce({ id: '1', message: '   ' });

    await expect(getTodayDailyMessage('tok')).resolves.toBeNull();
  });
});
