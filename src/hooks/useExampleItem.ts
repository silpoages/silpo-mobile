import { useMemo } from 'react';
import { getExampleItem } from '@/services/example';
import type { ExampleItem } from '@/types/example';

export function useExampleItem(): ExampleItem {
  return useMemo(() => getExampleItem(), []);
}
