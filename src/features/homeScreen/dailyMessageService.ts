import { apiRequest } from '@/services/apiClient';

type DailyMessageResponse = {
  id: string;
  message: string;
};

export async function getTodayDailyMessage(token: string): Promise<string | null> {
  const response = await apiRequest<DailyMessageResponse>('/daily-messages/today', { token });
  const message = response.message.trim();
  return message.length > 0 ? message : null;
}
