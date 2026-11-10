import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type AchievementIconName = ComponentProps<typeof Ionicons>['name'];

export type Achievement = {
  id: string;
  title: string;
  description: string;
  iconName: AchievementIconName;
  /** Data ISO (AAAA-MM-DD) em que foi desbloqueada; `null` enquanto não foi. */
  unlockedAt: string | null;
  /** Progresso das conquistas ainda bloqueadas, quando dá para medir. */
  progress?: { current: number; target: number };
};

/** Dados provisórios até o endpoint de conquistas existir no backend. */
export const ACHIEVEMENTS_MOCK: Achievement[] = [
  {
    id: 'first-mood',
    title: 'Primeiro registro',
    description: 'Registrou como estava se sentindo pela primeira vez.',
    iconName: 'leaf-outline',
    unlockedAt: '2026-10-02',
  },
  {
    id: 'first-breathing',
    title: 'Respiro fundo',
    description: 'Concluiu seu primeiro exercício de respiração.',
    iconName: 'water-outline',
    unlockedAt: '2026-10-05',
  },
  {
    id: 'first-good-practice',
    title: 'Fazendo o bem',
    description: 'Experimentou sua primeira prática do bem.',
    iconName: 'heart-outline',
    unlockedAt: '2026-10-12',
  },
  {
    id: 'week-streak',
    title: 'Uma semana de cuidado',
    description: 'Registrou suas emoções em 7 dias diferentes.',
    iconName: 'sunny-outline',
    unlockedAt: null,
    progress: { current: 4, target: 7 },
  },
  {
    id: 'explorer',
    title: 'Explorador',
    description: 'Experimentou 5 práticas do bem diferentes.',
    iconName: 'compass-outline',
    unlockedAt: null,
    progress: { current: 1, target: 5 },
  },
  {
    id: 'calm-mind',
    title: 'Mente tranquila',
    description: 'Concluiu 10 exercícios de respiração.',
    iconName: 'moon-outline',
    unlockedAt: null,
    progress: { current: 3, target: 10 },
  },
  {
    id: 'month-journey',
    title: 'Um mês de jornada',
    description: 'Registrou suas emoções em 30 dias diferentes.',
    iconName: 'sparkles-outline',
    unlockedAt: null,
    progress: { current: 4, target: 30 },
  },
];
