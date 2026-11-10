import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

const FALLBACK_ICON: IoniconName = 'star-outline';

/** O backend manda o nome do ícone como texto; um nome desconhecido cai na estrela. */
export function toAchievementIcon(icon: string): IoniconName {
  return icon in Ionicons.glyphMap ? (icon as IoniconName) : FALLBACK_ICON;
}
