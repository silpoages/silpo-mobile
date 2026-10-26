import type { ComponentProps } from 'react';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { MoodId } from './moodLogService';

type EmotionConfig = {
  id: MoodId;
  iconName: ComponentProps<typeof MaterialCommunityIcons>['name'];
  /** Rótulo do botão de registro ("Como você está se sentindo hoje?"). */
  label: string;
  /** Rótulo na distribuição da Jornada, como no protótipo ("Cansaço", "Tristeza"). */
  journeyLabel: string;
};

export const EMOTIONS: EmotionConfig[] = [
  { id: 'FELIZ', iconName: 'emoticon-excited-outline', label: 'Feliz', journeyLabel: 'Feliz' },
  { id: 'BEM', iconName: 'emoticon-outline', label: 'Bem', journeyLabel: 'Bem' },
  {
    id: 'CANSADO',
    iconName: 'emoticon-neutral-outline',
    label: 'Cansado',
    journeyLabel: 'Cansaço',
  },
  { id: 'TRISTE', iconName: 'emoticon-sad-outline', label: 'Triste', journeyLabel: 'Tristeza' },
  {
    id: 'ANSIOSO',
    iconName: 'emoticon-frown-outline',
    label: 'Ansioso',
    journeyLabel: 'Ansiedade',
  },
  {
    id: 'IRRITADO',
    iconName: 'emoticon-angry-outline',
    label: 'Irritado',
    journeyLabel: 'Irritação',
  },
];
