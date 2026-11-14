import { createActivitySession } from '@/features/breathingScreen/activityService';
import { apiRequest } from '@/services/apiClient';

export type Meditation = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number | null;
  audioUrl: string;
};

const MEDITATION_TYPE = 'meditation';

type ActivityListItem = {
  id: string;
  name: string;
  type: string;
  max_duration_seconds: number | null;
};

type ActivityListResponse = {
  items: ActivityListItem[];
};

type MeditationDetailResponse = {
  id: string;
  name: string;
  type: string;
  max_duration_seconds: number | null;
  audio_url: string;
  description?: string;
};

function toMeditation(response: MeditationDetailResponse): Meditation {
  return {
    id: response.id,
    title: response.name,
    description: response.description?.trim() ?? '',
    durationSeconds: response.max_duration_seconds,
    audioUrl: response.audio_url,
  };
}

/** Meditações habilitadas. A lista é `GET /activities`; o áudio só vem em `GET /activities/{id}`. */
export async function listMeditations(token: string): Promise<Meditation[]> {
  const list = await apiRequest<ActivityListResponse>('/activities', { token });
  const meditations = list.items.filter((item) => item.type === MEDITATION_TYPE);

  const details = await Promise.all(
    meditations.map((item) =>
      apiRequest<MeditationDetailResponse>(`/activities/${encodeURIComponent(item.id)}`, {
        token,
      }),
    ),
  );

  return details.map(toMeditation);
}

export async function registerMeditationSession(
  token: string,
  meditationId: string,
  timeSpentSeconds: number,
): Promise<void> {
  await createActivitySession(token, meditationId, timeSpentSeconds);
}
