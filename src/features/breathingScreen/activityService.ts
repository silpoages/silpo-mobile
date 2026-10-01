import { apiRequest } from '@/services/apiClient';

export type BreathingActivity = {
  id: string;
  name: string;
  type: 'breathing';
  maxDurationSeconds: number | null;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  repeatCount: number;
};

type BreathingActivityResponse = {
  id: string;
  name: string;
  type: string;
  max_duration_seconds: number | null;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
  repeat_count: number | null;
};

const INVALID_RESPONSE_MESSAGE = 'A API retornou parâmetros de respiração inválidos.';
const MISSING_ACTIVITY_MESSAGE = 'Nenhuma atividade de respiração está disponível.';

type ActivityListItem = {
  id: string;
  type: string;
};

type ActivityListResponse = {
  items: ActivityListItem[];
};

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isNullOrPositiveInteger(value: unknown): value is number | null {
  return value === null || isPositiveInteger(value);
}

function toBreathingActivity(raw: unknown): BreathingActivity {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const data = raw as Partial<BreathingActivityResponse>;
  const maxDuration = data.max_duration_seconds ?? null;
  const repeat = data.repeat_count ?? null;

  if (
    typeof data.id !== 'string' ||
    typeof data.name !== 'string' ||
    data.type !== 'breathing' ||
    !isPositiveInteger(data.inhale_seconds) ||
    !isPositiveInteger(data.hold_seconds) ||
    !isPositiveInteger(data.exhale_seconds) ||
    !isNullOrPositiveInteger(repeat) ||
    !isNullOrPositiveInteger(maxDuration)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const cycleSeconds = data.inhale_seconds + data.hold_seconds + data.exhale_seconds;
  const repeatCount =
    repeat ?? (maxDuration === null ? 1 : Math.max(1, Math.floor(maxDuration / cycleSeconds)));

  return {
    id: data.id,
    name: data.name,
    type: 'breathing',
    maxDurationSeconds: maxDuration,
    inhaleSeconds: data.inhale_seconds,
    holdSeconds: data.hold_seconds,
    exhaleSeconds: data.exhale_seconds,
    repeatCount,
  };
}

async function findBreathingActivityId(token: string | null): Promise<string> {
  const response = await apiRequest<unknown>('/activities', { token });

  if (typeof response !== 'object' || response === null || !('items' in response)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const items = (response as ActivityListResponse).items;
  if (!Array.isArray(items)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const breathing = items.find((item) => item?.type === 'breathing' && typeof item.id === 'string');
  if (!breathing) {
    throw new Error(MISSING_ACTIVITY_MESSAGE);
  }

  return breathing.id;
}

export async function getBreathingActivity(token: string | null): Promise<BreathingActivity> {
  const activityId = await findBreathingActivityId(token);
  const response = await apiRequest<unknown>(`/activities/${encodeURIComponent(activityId)}`, {
    token,
  });

  return toBreathingActivity(response);
}
