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
  breathing: {
    inhale_seconds: number;
    hold_seconds: number;
    exhale_seconds: number;
    repeat_count: number | null;
  };
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
  const config = data.breathing;

  if (typeof config !== 'object' || config === null) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const maxDuration = data.max_duration_seconds ?? null;
  const repeat = config.repeat_count ?? null;

  if (
    typeof data.id !== 'string' ||
    typeof data.name !== 'string' ||
    data.type !== 'breathing' ||
    !isPositiveInteger(config.inhale_seconds) ||
    !isPositiveInteger(config.hold_seconds) ||
    !isPositiveInteger(config.exhale_seconds) ||
    !isNullOrPositiveInteger(repeat) ||
    !isNullOrPositiveInteger(maxDuration)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const cycleSeconds = config.inhale_seconds + config.hold_seconds + config.exhale_seconds;
  const repeatCount =
    repeat ?? (maxDuration === null ? 1 : Math.max(1, Math.floor(maxDuration / cycleSeconds)));

  return {
    id: data.id,
    name: data.name,
    type: 'breathing',
    maxDurationSeconds: maxDuration,
    inhaleSeconds: config.inhale_seconds,
    holdSeconds: config.hold_seconds,
    exhaleSeconds: config.exhale_seconds,
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
