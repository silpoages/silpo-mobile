import { initDatabase } from '@/services/database';
import type { ExampleItem } from '@/types/example';

export function getExampleItem(): ExampleItem {
  initDatabase();

  return {
    id: 'template',
    title: 'Template de tela',
    description:
      'Isto não é uma feature do app. Copie types, service, hook, component e feature para a próxima tela.',
  };
}
