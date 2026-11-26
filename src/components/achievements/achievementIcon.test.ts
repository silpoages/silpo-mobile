import { toAchievementIcon } from './achievementIcon';

describe('toAchievementIcon', () => {
  it('mantém um nome de ícone Ionicons válido', () => {
    expect(toAchievementIcon('trophy')).toBe('trophy');
  });

  it('cai na estrela para um nome desconhecido', () => {
    expect(toAchievementIcon('icone-que-nao-existe')).toBe('star-outline');
  });
});
