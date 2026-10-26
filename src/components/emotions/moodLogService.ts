import { apiRequest } from '@/services/apiClient';

export type MoodId = 'FELIZ' | 'BEM' | 'CANSADO' | 'TRISTE' | 'ANSIOSO' | 'IRRITADO';

export type MoodLog = {
  id: string;
  mood: MoodId;
  postedAt: string;
};

type MoodLogResponse = {
  id: string;
  user_id: string;
  mood: MoodId;
  posted_at: string;
};

function toMoodLog(response: MoodLogResponse): MoodLog {
  return { id: response.id, mood: response.mood, postedAt: response.posted_at };
}

export async function getTodayMoodLog(token: string): Promise<MoodLog | null> {
  const response = await apiRequest<MoodLogResponse | null>('/mood-logs/today', { token });

  return response ? toMoodLog(response) : null;
}

export async function createMoodLog(token: string, mood: MoodId): Promise<MoodLog> {
  const response = await apiRequest<MoodLogResponse>('/mood-logs', {
    method: 'POST',
    token,
    body: { mood },
  });

  return toMoodLog(response);
}
