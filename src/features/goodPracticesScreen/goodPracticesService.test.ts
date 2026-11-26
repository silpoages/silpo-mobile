import { apiRequest } from '@/services/apiClient';
import {
  completeGoodPractice,
  getDailyGoodPractice,
  listGoodPractices,
} from '@/features/goodPracticesScreen/goodPracticesService';

jest.mock('@/services/apiClient', () => ({ apiRequest: jest.fn() }));

const mockApiRequest = jest.mocked(apiRequest);

describe('goodPracticesService', () => {
  it('lista as práticas sem campos extras', async () => {
    mockApiRequest.mockResolvedValueOnce({
      items: [{ id: 'p1', title: 'Gratidão', description: 'Agradeça', completed_today: true }],
    });

    await expect(listGoodPractices('tok')).resolves.toEqual([
      { id: 'p1', title: 'Gratidão', description: 'Agradeça' },
    ]);
    expect(mockApiRequest).toHaveBeenCalledWith('/good-practices', { token: 'tok' });
  });

  it('retorna a prática do dia com completedToday', async () => {
    mockApiRequest.mockResolvedValueOnce({
      items: [{ id: 'p1', title: 'Gratidão', description: 'Agradeça', completed_today: true }],
    });

    await expect(getDailyGoodPractice('tok')).resolves.toEqual({
      id: 'p1',
      title: 'Gratidão',
      description: 'Agradeça',
      completedToday: true,
    });
    expect(mockApiRequest).toHaveBeenCalledWith('/good-practices?daily=true', { token: 'tok' });
  });

  it('considera completedToday falso quando o campo não vem', async () => {
    mockApiRequest.mockResolvedValueOnce({
      items: [{ id: 'p1', title: 'Gratidão', description: 'Agradeça' }],
    });

    await expect(getDailyGoodPractice('tok')).resolves.toMatchObject({ completedToday: false });
  });

  it('retorna null quando não há prática do dia', async () => {
    mockApiRequest.mockResolvedValueOnce({ items: [] });

    await expect(getDailyGoodPractice('tok')).resolves.toBeNull();
  });

  it('conclui a prática com o id codificado na URL', async () => {
    mockApiRequest.mockResolvedValueOnce(undefined);

    await completeGoodPractice('tok', 'a b/c');
    expect(mockApiRequest).toHaveBeenCalledWith('/good-practices/a%20b%2Fc/complete', {
      method: 'POST',
      token: 'tok',
    });
  });
});
