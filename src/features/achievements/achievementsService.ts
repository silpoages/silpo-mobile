import { apiRequest } from '@/services/apiClient';

export type AchievementCategory = 'mood' | 'good_practice' | 'exercise' | 'diary';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  /** Nome do ícone Ionicons definido pelo backend. */
  icon: string;
  category: AchievementCategory;
  unlocked: boolean;
  progress: { current: number; target: number };
  /** Data ISO do desbloqueio; `null` enquanto bloqueada. */
  unlockedAt: string | null;
};

const INVALID_RESPONSE_MESSAGE = 'A API retornou conquistas inválidas.';
const CATEGORIES: readonly string[] = ['mood', 'good_practice', 'exercise', 'diary'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function toAchievement(raw: unknown): Achievement {
  if (!isRecord(raw) || !isRecord(raw.progress)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const { id, name, description, icon, category, unlocked, progress } = raw;
  const unlockedAt = raw.unlocked_at;

  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof description !== 'string' ||
    typeof icon !== 'string' ||
    typeof category !== 'string' ||
    !CATEGORIES.includes(category) ||
    typeof unlocked !== 'boolean' ||
    !isCount(progress.current) ||
    !isCount(progress.target) ||
    (unlockedAt !== null && typeof unlockedAt !== 'string')
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    id,
    name,
    description,
    icon,
    category: category as AchievementCategory,
    unlocked,
    progress: { current: progress.current, target: progress.target },
    unlockedAt,
  };
}

function toAchievementList(raw: unknown): Achievement[] {
  if (!isRecord(raw) || !Array.isArray(raw.items)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return raw.items.map(toAchievement);
}

/** Todas as conquistas, com o progresso do usuário autenticado (`GET /achievements`). */
export async function getAchievements(token: string): Promise<Achievement[]> {
  return toAchievementList(await apiRequest<unknown>('/achievements', { token }));
}

/** Desbloqueios cujo alerta ainda não foi confirmado, do mais antigo ao mais novo. */
export async function getPendingAchievements(token: string): Promise<Achievement[]> {
  return toAchievementList(await apiRequest<unknown>('/achievements/pending', { token }));
}

/** Confirma que o usuário viu o alerta; repetir a chamada não tem efeito. */
export async function acknowledgeAchievement(token: string, achievementId: string): Promise<void> {
  await apiRequest(`/achievements/${encodeURIComponent(achievementId)}/acknowledge`, {
    method: 'POST',
    token,
  });
}
