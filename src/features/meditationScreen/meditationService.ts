import { createActivitySession } from '@/features/breathingScreen/activityService';
import { apiRequest } from '@/services/apiClient';

export type Meditation = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number | null;
  audioUrl: string;
};

type MeditationResponse = {
  id: string;
  name: string;
  description: string;
  audio_url: string;
  max_duration_seconds: number | null;
};

type MeditationListResponse = {
  items: MeditationResponse[];
};

function toMeditation(response: MeditationResponse): Meditation {
  return {
    id: response.id,
    title: response.name,
    description: response.description,
    durationSeconds: response.max_duration_seconds,
    audioUrl: response.audio_url,
  };
}

export async function listMeditations(token: string): Promise<Meditation[]> {
  const response = await apiRequest<MeditationListResponse>('/meditations', { token });

  return response.items.map(toMeditation);
}

export async function registerMeditationSession(
  token: string,
  meditationId: string,
  timeSpentSeconds: number,
): Promise<void> {
  await createActivitySession(token, meditationId, timeSpentSeconds);
}
