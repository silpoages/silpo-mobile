import { apiRequest } from '@/services/apiClient';

export type QuickActionId = 'respirar' | 'meditar' | 'autorregulação';

type StartPracticeResponse = {
  id: string;
  action: QuickActionId;
  started_at: string;
};

export async function startQuickAction(
  token: string,
  activityId: string,
): Promise<StartPracticeResponse> {
  return apiRequest<StartPracticeResponse>('/activity-sessions', {
    method: 'POST',
    token,
    body: {
      activity_id: activityId,
    },
  });
}
