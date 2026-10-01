import { apiRequest } from '@/services/apiClient';
import type { Practice } from '@/components/practicesScreen/PracticeCard';

type GoodPracticeResponse = {
  id: string;
  title: string;
  description: string;
};

type GoodPracticeListResponse = {
  items: GoodPracticeResponse[];
};

function toPractice(response: GoodPracticeResponse): Practice {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
  };
}

/** Lista as práticas do bem habilitadas (`GET /good-practices`). */
export async function listGoodPractices(token: string): Promise<Practice[]> {
  const response = await apiRequest<GoodPracticeListResponse>('/good-practices', { token });

  return response.items.map(toPractice);
}

/** Registra a conclusão de uma prática (`POST /good-practices/{id}/complete`). */
export async function completeGoodPractice(token: string, goodPracticeId: string): Promise<void> {
  await apiRequest(`/good-practices/${encodeURIComponent(goodPracticeId)}/complete`, {
    method: 'POST',
    token,
  });
}
