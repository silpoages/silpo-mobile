import { EMOTIONS } from '@/components/emotions/emotionConfig';
import type { MoodId } from '@/components/emotions/moodLogService';
import { apiRequest } from '@/services/apiClient';

export type JourneyData = {
  daysRegistered: number;
  practicesTried: number;
  exercisesCompleted: number;
  moodCounts: Partial<Record<MoodId, number>>;
  achievements: { unlocked: number; total: number };
};

type JourneyResponse = {
  summary: {
    mood_days: number;
    different_good_practices: number;
    completed_activities: number;
  };
  mood_distribution: { mood: string; count: number }[];
  achievements: { unlocked: number; total: number };
};

const INVALID_RESPONSE_MESSAGE = 'A API retornou um resumo de jornada inválido.';

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isMoodId(value: string): value is MoodId {
  return EMOTIONS.some((emotion) => emotion.id === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toJourneyData(raw: unknown): JourneyData {
  if (!isRecord(raw) || !isRecord(raw.summary) || !isRecord(raw.achievements)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const data = raw as Partial<JourneyResponse>;
  const summary = data.summary;
  const achievements = data.achievements;
  const distribution = data.mood_distribution;

  if (
    !summary ||
    !achievements ||
    !Array.isArray(distribution) ||
    !isCount(summary.mood_days) ||
    !isCount(summary.different_good_practices) ||
    !isCount(summary.completed_activities) ||
    !isCount(achievements.unlocked) ||
    !isCount(achievements.total)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const moodCounts: Partial<Record<MoodId, number>> = {};
  for (const item of distribution) {
    if (!isRecord(item) || typeof item.mood !== 'string' || !isCount(item.count)) {
      throw new Error(INVALID_RESPONSE_MESSAGE);
    }
    if (isMoodId(item.mood)) {
      moodCounts[item.mood] = item.count;
    }
  }

  return {
    daysRegistered: summary.mood_days,
    practicesTried: summary.different_good_practices,
    exercisesCompleted: summary.completed_activities,
    moodCounts,
    achievements: { unlocked: achievements.unlocked, total: achievements.total },
  };
}

/** Resumo do mês corrente do usuário autenticado (`GET /journey`). */
export async function getJourney(token: string): Promise<JourneyData> {
  const response = await apiRequest<unknown>('/journey', { token });

  return toJourneyData(response);
}
