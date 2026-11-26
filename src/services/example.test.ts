import { initDatabase } from '@/services/database';
import { getExampleItem } from '@/services/example';

describe('example service', () => {
  it('initDatabase ainda não faz nada', () => {
    expect(initDatabase()).toBeUndefined();
  });

  it('getExampleItem devolve o item do template', () => {
    expect(getExampleItem()).toEqual({
      id: 'template',
      title: 'Template de tela',
      description: expect.stringContaining('Isto não é uma feature do app'),
    });
  });
});
